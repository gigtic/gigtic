import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../utils/supabase';
import { Send, CheckCircle2, Star } from 'lucide-react-native';

export default function ChatMessageScreen() {
  const { id: jobId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (jobId) loadChat();
  }, [jobId]);

  const loadChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      // Fetch Job Details
      const { data: jobData } = await supabase
        .from("jobs")
        .select("*, requester:requester_id(nickname), provider:provider_id(nickname)")
        .eq("id", jobId)
        .single();
        
      setJob(jobData);

      // Fetch Messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*, sender:sender_id(nickname)")
        .eq("job_id", jobId)
        .order("created_at", { ascending: true });
        
      setMessages(msgs || []);

      // Real-time subscription
      const subscription = supabase
        .channel(`chat_mobile_${jobId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${jobId}` },
          async (payload) => {
            const { data: senderData } = await supabase.from('users').select('nickname').eq('id', payload.new.sender_id).single();
            const fullMessage = { ...payload.new, sender: senderData };
            setMessages((prev) => [...prev, fullMessage]);
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
          }
        )
        .subscribe();

      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !jobId) return;

    const content = newMessage;
    setNewMessage(""); 

    await supabase.from("messages").insert({
      job_id: jobId,
      sender_id: currentUser.id,
      content: content
    });
  };

  const handleHandshake = async () => {
    if (!currentUser || !jobId) return;
    
    const { data, error } = await supabase.rpc('process_payment_handshake', {
      p_job_id: jobId,
      p_user_id: currentUser.id
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Status", data.message);
      loadChat(); // Refresh
    }
  };

  const handleSubmitReview = async () => {
    if (!currentUser || !jobId || reviewRating === 0) return;
    setSubmittingReview(true);
    
    const revieweeId = isRequester ? job.provider_id : job.requester_id;
    
    const { error } = await supabase.from("reviews").insert({
      job_id: jobId,
      reviewer_id: currentUser.id,
      reviewee_id: revieweeId,
      rating: reviewRating
    });

    setSubmittingReview(false);
    if (error) {
      if (error.code === '23505') Alert.alert("Error", "You already reviewed this user.");
      else Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Review submitted successfully!");
      setReviewRating(0);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const isRequester = currentUser?.id === job?.requester_id;
  const isWaiting = (isRequester && job?.requester_marked_paid) || (!isRequester && job?.provider_marked_received);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{job?.title}</Text>
          <Text style={styles.headerSubtitle}>₹{job?.budget_amount}</Text>
        </View>
        
        {job?.status === 'IN_PROGRESS' && (
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMe = item.sender_id === currentUser?.id;
          return (
            <View style={[styles.messageWrapper, isMe ? styles.messageMeWrapper : styles.messageThemWrapper]}>
              <Text style={styles.senderName}>{isMe ? 'You' : item.sender?.nickname || 'User'}</Text>
              <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
                <Text style={[styles.messageText, isMe ? styles.messageMeText : styles.messageThemText]}>
                  {item.content}
                </Text>
              </View>
            </View>
          );
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input */}
      {job?.status !== 'COMPLETED' ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
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
      ) : (
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>This Gig is Completed</Text>
          <Text style={styles.completedSubtitle}>Leave a trust review for the other student.</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setReviewRating(star)} style={styles.starBtn}>
                <Star 
                  color={reviewRating >= star ? "#FB923C" : "#D1D5DB"} 
                  fill={reviewRating >= star ? "#FB923C" : "transparent"} 
                  size={32} 
                />
              </TouchableOpacity>
            ))}
          </View>
          {reviewRating > 0 && (
            <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview} disabled={submittingReview}>
              {submittingReview ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitReviewText}>Submit Review</Text>}
            </TouchableOpacity>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backButton: { marginRight: 16 },
  backText: { color: '#2563EB', fontSize: 16, fontWeight: '600' },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  handshakeButton: { backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  handshakeWaiting: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#BBF7D0' },
  handshakeText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  messageList: { padding: 16, paddingBottom: 32 },
  messageWrapper: { marginBottom: 16, maxWidth: '80%' },
  messageMeWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  messageThemWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', marginBottom: 4, paddingHorizontal: 4 },
  messageBubble: { padding: 12, borderRadius: 20 },
  messageMe: { backgroundColor: '#000', borderBottomRightRadius: 4 },
  messageThem: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F3F4F6' },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageMeText: { color: '#fff', fontWeight: '500' },
  messageThemText: { color: '#111827', fontWeight: '500' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 24, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 16, maxHeight: 100 },
  sendButton: { backgroundColor: '#000', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 12, marginBottom: 2 },
  sendButtonDisabled: { backgroundColor: '#9CA3AF' },
  completedContainer: { padding: 24, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingBottom: 40 },
  completedTitle: { color: '#111827', fontWeight: '900', fontSize: 18, marginBottom: 4 },
  completedSubtitle: { color: '#6B7280', fontWeight: '500', fontSize: 14, marginBottom: 16 },
  starsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  starBtn: { padding: 4 },
  submitReviewBtn: { backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, width: '100%', alignItems: 'center' },
  submitReviewText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
