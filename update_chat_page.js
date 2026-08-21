const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Imports
if (!code.includes('Camera')) {
  code = code.replace(/import \{ (.*?) \} from "lucide-react";/, 'import { $1, Camera, Image as ImageIcon } from "lucide-react";');
}

// 2. Add handleImageUpload and compression
const uploadFunction = `
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !conversation) return;
    
    // Reset input
    e.target.value = '';

    setIsSubmitting(true);
    try {
      // 1. Check limit (max 2 photos)
      const { count, error: countErr } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversation.id)
        .not('image_url', 'is', null);
        
      if (count !== null && count >= 2) {
        toast.error("Maximum 2 photos allowed per chat to save space.");
        setIsSubmitting(false);
        return;
      }

      // 2. Compress image using native Canvas
      const compressedBlob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; // Super compressed
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas to Blob failed'));
              }, 'image/jpeg', 0.6); // 60% quality JPEG
            } else {
              reject(new Error('Canvas context failed'));
            }
          };
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      // 3. Upload to storage
      const fileName = \`\${conversation.id}/\${Date.now()}.jpg\`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('chat_images')
        .upload(fileName, compressedBlob, { contentType: 'image/jpeg' });
        
      if (uploadErr) {
        console.error("Upload error:", uploadErr);
        toast.error("Failed to upload image. Please check your storage settings.");
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('chat_images')
        .getPublicUrl(fileName);

      // 4. Send Message
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        content: "📷 Photo",
        image_url: publicUrlData.publicUrl
      });
      
      // 5. Notification
      const otherUserId = conversation.requester_id === currentUser.id ? conversation.worker_id : conversation.requester_id;
      const myUsername = conversation.requester_id === currentUser.id ? conversation.requester?.username : conversation.worker?.username;
      
      await supabase.from("notifications").insert({
        user_id: otherUserId,
        type: \`chat_message|/chat?job=\${jobId || ''}&conv=\${conversation?.id || ''}\${dmParam ? '&dm=' + dmParam : ''}\`,
        message: \`📷 New photo from @\${myUsername || 'someone'}\`
      });

    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    }
    setIsSubmitting(false);
  };
`;
const handleSendMessageMatch = code.match(/const handleSendMessage = async \([^)]*\) => \{/);
if (handleSendMessageMatch) {
  code = code.replace(handleSendMessageMatch[0], uploadFunction + '\n  ' + handleSendMessageMatch[0]);
}

// 3. Add file input UI next to text area
const inputUI = `<div className="flex-1 bg-white border border-gray-200/80 rounded-3xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm flex items-center pr-1.5 pl-1.5 min-h-[48px]">`;
const inputUIReplacement = `<div className="flex-1 bg-white border border-gray-200/80 rounded-3xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm flex items-center pr-1.5 pl-1.5 min-h-[48px]">
              <label className="cursor-pointer p-2 shrink-0 text-gray-400 hover:text-indigo-500 transition-colors">
                <Camera className="w-5 h-5" />
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  disabled={isSubmitting}
                />
              </label>`;
code = code.replace(inputUI, inputUIReplacement);

// 4. Render image in messages
const renderMessage = `<p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>`;
const renderMessageReplacement = `<p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                {msg.image_url && (
                  <div className="mt-2 rounded-xl overflow-hidden shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={msg.image_url} alt="Shared photo" className="max-w-full h-auto max-h-[300px] object-cover" />
                  </div>
                )}`;
code = code.replace(renderMessage, renderMessageReplacement);

// 5. Auto delete images on "Mark as Received"
const markReceived = `await supabase.from("jobs").update({ status: 'COMPLETED' }).eq("id", jobId);`;
const markReceivedReplacement = `await supabase.from("jobs").update({ status: 'COMPLETED' }).eq("id", jobId);
      
      // Auto-delete images for this conversation to save space
      if (conversation) {
        const { data: msgs } = await supabase.from('messages')
          .select('image_url')
          .eq('conversation_id', conversation.id)
          .not('image_url', 'is', null);
          
        if (msgs && msgs.length > 0) {
          const paths = msgs.map(m => {
            if (!m.image_url) return null;
            const parts = m.image_url.split('/chat_images/');
            return parts.length > 1 ? parts[1] : null;
          }).filter(Boolean) as string[];
          
          if (paths.length > 0) {
            await supabase.storage.from('chat_images').remove(paths);
            
            await supabase.from('messages')
              .update({ content: "📷 Photo (Auto-deleted after completion)", image_url: null })
              .eq('conversation_id', conversation.id)
              .not('image_url', 'is', null);
          }
        }
      }`;
code = code.replace(markReceived, markReceivedReplacement);

fs.writeFileSync(file, code);
