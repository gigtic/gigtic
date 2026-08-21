const fs = require('fs');
const path = 'apps/web/app/chat/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('const [hasReviewed, setHasReviewed]')) {
  content = content.replace(
    'const [readReceiptsUnlocked, setReadReceiptsUnlocked] = useState(false);',
    `const [readReceiptsUnlocked, setReadReceiptsUnlocked] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);`
  );

  content = content.replace(
    'setJob(jobData);',
    `setJob(jobData);
      if (jobData?.status === 'COMPLETED') {
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('job_id', jobId)
          .eq('reviewer_id', user.id)
          .single();
        if (existingReview) {
          setHasReviewed(true);
        } else {
          setHasReviewed(false);
          setShowReviewModal(true);
        }
      }`
  );

  content = content.replace(
    'const loadChatData = async (silent = false) => {',
    `const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !currentUser || !jobId) return;
    setIsSubmittingReview(true);
    try {
      const revieweeId = currentUser.id === job.requester_id ? job.provider_id : job.requester_id;
      const { error } = await supabase.from('reviews').insert({
        job_id: jobId,
        reviewer_id: currentUser.id,
        reviewee_id: revieweeId,
        rating: reviewRating,
        comment: reviewComment
      });
      if (error) throw error;
      toast.success("Review submitted successfully!");
      setHasReviewed(true);
      setShowReviewModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const loadChatData = async (silent = false) => {`
  );

  content = content.replace(
    '{/* Fullscreen Image Modal */}',
    `{/* Review Modal */}
      {showReviewModal && job?.status === 'COMPLETED' && !hasReviewed && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Leave a Review</h3>
            <p className="text-gray-500 text-sm mb-6">How was your experience working with {currentUser?.id === job.requester_id ? job.provider?.username : job.requester?.username}?</p>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star className={\`w-10 h-10 \${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}\`} />
                  </button>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-gray-900 text-sm resize-none"
                  rows={3}
                  placeholder="Share details of your experience..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}`
  );

  fs.writeFileSync(path, content);
  console.log("Chat page patched successfully.");
} else {
  console.log("Chat page already patched.");
}
