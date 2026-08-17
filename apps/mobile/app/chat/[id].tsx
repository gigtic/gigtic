import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../utils/supabase';
import { Send, CheckCircle2, User } from 'lucide-react-native';

export default function ChatMessageScreen() {
  const { id: convId, jobId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  
  const [isTyping, setIsTyping] = useState(false);
  const broadcastChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEventRef = useRef<number>(0);

  // Parse if it's a DM directly from the URL param (e.g. dm_123)
  const isDirectMessage = typeof convId === 'string' && convId.startsWith('dm_');
  const targetUserId = isDirectMessage ? (convId as string).replace('dm_', '') : null;

  useEffect(() => {
    loadChat();
    return () => {
      supabase.getChannels().forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [convId]);

  const loadChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (!user) return;

    let currentConvId = convId;

    if (isDirectMessage && targetUserId) {
      // Find or create DM conversation
      let { data: conv } = await supabase
        .from("conversations")
        .select("*, requester:requester_id(nickname), worker:worker_id(nickname)")
        .eq("is_dm", true)
        .or(`and(requester_id.eq.${user.id},worker_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},worker_id.eq.${user.id})`)
        .single();
        
      if (!conv) {
        const { data: newConv } = await supabase.from("conversations").insert({
          requester_id: user.id,
          worker_id: targetUserId,
          is_dm: true
        }).select("*, requester:requester_id(nickname), worker:worker_id(nickname)").single();
        conv = newConv;
      }
      setConversation(conv);
      currentConvId = conv?.id;
    } else {
      // Fetch normal conversation
      const { data: conv } = await supabase
        .from("conversations")
        .select("*, requester:requester_id(nickname), worker:worker_id(nickname)")
        .eq("id", currentConvId)
        .single();
      setConversation(conv);
      
      if (conv?.job_id || jobId) {
        const { data: jobData } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", conv?.job_id || jobId)
          .single();
        setJob(jobData);
      }
    }

    if (currentConvId) {
      // Fetch Messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*, sender:sender_id(nickname)")
        .eq("conversation_id", currentConvId)
        .order("created_at", { ascending: true });
        
      setMessages(msgs || []);

      // Real-time subscription
      const channel = supabase.channel(`chat_mobile_${currentConvId}`);
      broadcastChannelRef.current = channel;

      channel
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${currentConvId}` },
          async (payload) => {
            if (payload.new.sender_id !== user.id) {
              setIsTyping(false);
            }
            const { data: senderData } = await supabase.from('users').select('nickname').eq('id', payload.new.sender_id).single();
            const fullMessage = { ...payload.new, sender: senderData };
            setMessages((prev) => {
              if (prev.some(m => m.id === payload.new.id)) return prev;
              return [...prev, fullMessage];
            });
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
          }
        )
        .on(
          'broadcast',
          { event: 'typing' },
          (payload) => {
            if (payload.payload.userId !== user.id) {
              setIsTyping(true);
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
              }, 3000);
              setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
            }
          }
        )
        .subscribe();
    }

    setLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !conversation) return;
    const content = newMessage;
    setNewMessage(""); 
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: currentUser.id,
      content: content
    });

    // Send push notification to the other user
    const otherUserId = conversation.requester_id === currentUser.id ? conversation.worker_id : conversation.requester_id;
    if (otherUserId) {
      const { sendPushNotification } = require('../../../utils/push');
      sendPushNotification(
        otherUserId,
        currentUser.user_metadata?.nickname || 'New Message',
        content,
        { url: `/chat/${conversation.id}` }
      );
    }
  };

  const handleHandshake = async () => {
    if (!currentUser || !job) return;
    const { data, error } = await supabase.rpc('process_payment_handshake', {
      p_job_id: job.id,
      p_user_id: currentUser.id
    });
    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Status", data.message);
      loadChat();
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    const now = Date.now();
    if (now - lastTypingEventRef.current > 1000 && broadcastChannelRef.current && currentUser) {
      lastTypingEventRef.current = now;
      broadcastChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUser.id }
      });
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>;
  }

  const isRequester = currentUser?.id === job?.requester_id;
  const isWaiting = (isRequester && job?.requester_marked_paid) || (!isRequester && job?.provider_marked_received);
  const otherPerson = conversation?.requester_id === currentUser?.id ? conversation?.worker : conversation?.requester;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.avatar}>
          <User size={16} color="#fff" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {conversation?.is_dm ? `Chat with ${otherPerson?.nickname}` : job?.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {conversation?.is_dm ? "Direct Message" : `₹${job?.budget_amount} • ${job?.status}`}
          </Text>
        </View>
        
        {!conversation?.is_dm && job?.status === 'IN_PROGRESS' && (
          <TouchableOpacity 
            style={[styles.handshakeButton, isWaiting && styles.handshakeWaiting]} 
            onPress={handleHandshake}
          >
            {isWaiting ? (
              <CheckCircle2 color="#15803D" size={16} />
            ) : (
              <Text style={styles.handshakeText}>{isRequester ? 'Pay' : 'Receive'}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMe = item.sender_id === currentUser?.id;
          return (
            <View style={[styles.messageWrapper, isMe ? styles.messageMeWrapper : styles.messageThemWrapper]}>
              <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
                <Text style={[styles.messageText, isMe ? styles.messageMeText : styles.messageThemText]}>
                  {item.content}
                </Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={() => 
          isTyping ? (
            <View style={styles.typingIndicatorContainer}>
              <Text style={styles.typingIndicatorText}>✍️ {otherPerson?.nickname || 'Someone'} is typing...</Text>
            </View>
          ) : null
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input */}
      {(!job || (job.status !== 'COMPLETED' && job.status !== 'ABANDONED' && job.status !== 'DELETED')) && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]} 
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backButton: { marginRight: 12 },
  backText: { color: '#000', fontSize: 16, fontWeight: '800' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  handshakeButton: { backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  handshakeWaiting: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#BBF7D0' },
  handshakeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  messageList: { padding: 16, paddingBottom: 32 },
  messageWrapper: { marginBottom: 12, maxWidth: '80%' },
  messageMeWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  messageThemWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageBubble: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 24 },
  messageMe: { backgroundColor: '#111827', borderBottomRightRadius: 4 },
  messageThem: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F3F4F6' },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageMeText: { color: '#fff', fontWeight: '600' },
  messageThemText: { color: '#111827', fontWeight: '500' },
  typingIndicatorContainer: { alignSelf: 'flex-start', marginBottom: 12, marginLeft: 8 },
  typingIndicatorText: { color: '#6B7280', fontSize: 13, fontWeight: '600', fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', alignItems: 'flex-end', paddingBottom: 32 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, fontSize: 16, maxHeight: 100, fontWeight: '500' },
  sendButton: { backgroundColor: '#111827', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginLeft: 12, marginBottom: 0 },
  sendButtonDisabled: { backgroundColor: '#D1D5DB' },
});
