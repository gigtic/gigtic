const fs = require('fs');

// Patch Admin Sidebar
const sidebarPath = 'apps/admin/components/AdminSidebar.tsx';
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

if (!sidebarContent.includes('id: "reviews"')) {
  sidebarContent = sidebarContent.replace(
    'import { LayoutDashboard, Users, BarChart3, ShieldAlert, Database, KeyRound, Shield, DollarSign, Megaphone } from \'lucide-react\';',
    'import { LayoutDashboard, Users, BarChart3, ShieldAlert, Database, KeyRound, Shield, DollarSign, Megaphone, Star } from \'lucide-react\';'
  );

  sidebarContent = sidebarContent.replace(
    '{ id: "user_management", label: "User Management", icon: Users },',
    `{ id: "user_management", label: "User Management", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },`
  );
  
  fs.writeFileSync(sidebarPath, sidebarContent);
  console.log("Admin Sidebar patched.");
}

// Patch Admin Page
const pagePath = 'apps/admin/app/page.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');

if (!pageContent.includes('activeTab === "reviews"')) {
  pageContent = pageContent.replace(
    'import { Loader2, ShieldAlert, TrendingUp, Users, Activity, DollarSign, Server, CheckCircle2, BarChart3, MousePointerClick, Eye, IndianRupee, Search, KeyRound, Webhook, Link2, Shield, Trash2, Plus, Megaphone } from \'lucide-react\';',
    'import { Loader2, ShieldAlert, TrendingUp, Users, Activity, DollarSign, Server, CheckCircle2, BarChart3, MousePointerClick, Eye, IndianRupee, Search, KeyRound, Webhook, Link2, Shield, Trash2, Plus, Megaphone, Star } from \'lucide-react\';'
  );

  pageContent = pageContent.replace(
    '{["overview", "adsterra_ads", "user_management", "push_notifications", "reports_&_issues", "database", "api_management", "access_control"]',
    '{["overview", "adsterra_ads", "user_management", "reviews", "push_notifications", "reports_&_issues", "database", "api_management", "access_control"]'
  );

  const reviewsComponent = `
function ReviewsAdminTab() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:reviewer_id(username), reviewee:reviewee_id(username)')
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) {
      setReviews(reviews.filter(r => r.id !== id));
      alert("Review deleted.");
    } else {
      alert("Error deleting review.");
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 flex items-center gap-2"><Star className="w-5 h-5 text-indigo-600"/> Platform Reviews</h4>
            <p className="text-xs text-slate-500 mt-1">Manage and moderate user reviews.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Reviewer</th>
                <th className="px-6 py-4 font-bold">Reviewee</th>
                <th className="px-6 py-4 font-bold">Rating</th>
                <th className="px-6 py-4 font-bold">Comment</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map(review => (
                <tr key={review.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">{new Date(review.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">@{review.reviewer?.username}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">@{review.reviewee?.username}</td>
                  <td className="px-6 py-4 font-bold text-amber-500">{review.rating} / 5</td>
                  <td className="px-6 py-4">{review.comment || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteReview(review.id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No reviews found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;

  pageContent = pageContent.replace(
    'function AdsterraDashboard() {',
    `${reviewsComponent}\n\nfunction AdsterraDashboard() {`
  );

  pageContent = pageContent.replace(
    '{/* Database Content */}',
    `{/* Reviews Content */}
      {activeTab === "reviews" && (
        <ReviewsAdminTab />
      )}

      {/* Database Content */}`
  );

  fs.writeFileSync(pagePath, pageContent);
  console.log("Admin Page patched.");
} else {
  console.log("Admin Page already patched.");
}
