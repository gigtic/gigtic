import re

with open('apps/admin/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Add imports
content = content.replace('"use client";\n', '"use client";\n\nimport { toast } from "react-hot-toast";\n')

# 2. Add X to lucide-react import
content = re.sub(r'(import \{ [^}]+)( \} from \'lucide-react\';)', r'\1, X\2', content)

modal_jsx = """
      {/* Confirm Modal */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Confirm Action</h3>
              <button onClick={() => setConfirmModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">{confirmModal.message}</p>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setConfirmModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                  Cancel
                </button>
                <button 
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
"""

# 3. Modify ReviewsAdminTab
reviews_state = "  const [reviews, setReviews] = useState<any[]>([]);\n  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);"
content = content.replace("  const [reviews, setReviews] = useState<any[]>([]);", reviews_state)

handleDeleteReview_old = """  const handleDeleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) {
      setReviews(reviews.filter(r => r.id !== id));
      alert("Review deleted.");
    } else {
      alert("Error deleting review.");
    }
  };"""
handleDeleteReview_new = """  const handleDeleteReview = (id: number) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this review?",
      onConfirm: async () => {
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (!error) {
          setReviews(reviews.filter(r => r.id !== id));
          toast.success("Review deleted.");
        } else {
          toast.error("Error deleting review.");
        }
        setConfirmModal(null);
      }
    });
  };"""
content = content.replace(handleDeleteReview_old, handleDeleteReview_new)

# Add modal to ReviewsAdminTab
content = content.replace("    </div>\n  );\n}\n\n\nfunction AdsterraDashboard()", modal_jsx + "    </div>\n  );\n}\n\n\nfunction AdsterraDashboard()")


# 4. Modify AdminDashboardContent
admin_state = "  const [onlineCount, setOnlineCount] = useState(0);\n  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);"
content = content.replace("  const [onlineCount, setOnlineCount] = useState(0);", admin_state)

updateUserStatus_old = """  const updateUserStatus = async (userId: string, status: string) => {
    if (!confirm(`Are you sure you want to change this user's status to ${status}?`)) return;
    const { error } = await supabase.rpc('admin_update_user_status', { target_user_id: userId, new_status: status });
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, account_status: status } : u));
      const actionText = status === 'SUSPENDED' ? 'suspended' : (status === 'BANNED' ? 'blocked' : 'reactivated');
      await supabase.from('notifications').insert([{ 
        user_id: userId, 
        message: `⚠️ Security Alert: Your account has been ${actionText} by the GigTic Admin.` 
      }]);
    } else {
      alert("Failed to update status. Make sure the SQL RPC is deployed.");
    }
  };"""

updateUserStatus_new = """  const updateUserStatus = (userId: string, status: string) => {
    setConfirmModal({
      isOpen: true,
      message: `Are you sure you want to change this user's status to ${status}?`,
      onConfirm: async () => {
        const { error } = await supabase.rpc('admin_update_user_status', { target_user_id: userId, new_status: status });
        if (!error) {
          setUsers(users.map(u => u.id === userId ? { ...u, account_status: status } : u));
          const actionText = status === 'SUSPENDED' ? 'suspended' : (status === 'BANNED' ? 'blocked' : 'reactivated');
          await supabase.from('notifications').insert([{ 
            user_id: userId, 
            message: `⚠️ Security Alert: Your account has been ${actionText} by the GigTic Admin.` 
          }]);
          toast.success("Status updated successfully.");
        } else {
          toast.error("Failed to update status. Make sure the SQL RPC is deployed.");
        }
        setConfirmModal(null);
      }
    });
  };"""
content = content.replace(updateUserStatus_old, updateUserStatus_new)

deleteUser_old = """  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to completely permanently delete this user profile? This cannot be undone.")) return;
    const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
    if (!error) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      alert("Failed to delete user. Make sure the SQL RPC is deployed.");
    }
  };"""

deleteUser_new = """  const deleteUser = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to completely permanently delete this user profile? This cannot be undone.",
      onConfirm: async () => {
        const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
        if (!error) {
          setUsers(users.filter(u => u.id !== userId));
          toast.success("User deleted successfully.");
        } else {
          toast.error("Failed to delete user. Make sure the SQL RPC is deployed.");
        }
        setConfirmModal(null);
      }
    });
  };"""
content = content.replace(deleteUser_old, deleteUser_new)

handleAddAdmin_old = """  const handleAddAdmin = async (e: any) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    setIsAddingAdmin(true);
    const { error } = await supabase.rpc('add_admin', { new_email: newAdminEmail });
    if (error) {
      alert("Failed to add admin. Please deploy the SQL script first.");
    } else {
      setNewAdminEmail("");
      checkAuthAndLoadData(); // refresh list
    }
    setIsAddingAdmin(false);
  };"""
handleAddAdmin_new = """  const handleAddAdmin = async (e: any) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    setIsAddingAdmin(true);
    const { error } = await supabase.rpc('add_admin', { new_email: newAdminEmail });
    if (error) {
      toast.error("Failed to add admin. Please deploy the SQL script first.");
    } else {
      setNewAdminEmail("");
      checkAuthAndLoadData(); // refresh list
      toast.success("Admin added successfully.");
    }
    setIsAddingAdmin(false);
  };"""
content = content.replace(handleAddAdmin_old, handleAddAdmin_new)

handleRemoveAdmin_old = """  const handleRemoveAdmin = async (targetEmail: string) => {
    const { error } = await supabase.rpc('remove_admin', { target_email: targetEmail });
    if (error) {
      alert("Failed to remove admin.");
    } else {
      checkAuthAndLoadData(); // refresh list
    }
  };"""
handleRemoveAdmin_new = """  const handleRemoveAdmin = (targetEmail: string) => {
    setConfirmModal({
      isOpen: true,
      message: `Are you sure you want to remove admin access for ${targetEmail}?`,
      onConfirm: async () => {
        const { error } = await supabase.rpc('remove_admin', { target_email: targetEmail });
        if (error) {
          toast.error("Failed to remove admin.");
        } else {
          checkAuthAndLoadData(); // refresh list
          toast.success("Admin removed successfully.");
        }
        setConfirmModal(null);
      }
    });
  };"""
content = content.replace(handleRemoveAdmin_old, handleRemoveAdmin_new)

broadcast_old = """                onClick={async () => {
                  const msg = (document.getElementById('broadcastMessage') as HTMLTextAreaElement).value;
                  if (!msg) return alert("Message cannot be empty!");
                  
                  const { data: allUsers } = await supabase.from('users').select('id');
                  if (!allUsers || allUsers.length === 0) return alert("No users found");
                  
                  const notifications = allUsers.map(u => ({
                    user_id: u.id,
                    type: 'system_broadcast',
                    message: "📣 GigTic Official: " + msg
                  }));
                  
                  const { error } = await supabase.from('notifications').insert(notifications);
                  if (error) {
                    alert("Failed to broadcast: " + error.message);
                  } else {
                    alert(`Successfully sent to ${allUsers.length} users!`);
                    (document.getElementById('broadcastMessage') as HTMLTextAreaElement).value = '';
                  }
                }}"""

broadcast_new = """                onClick={() => {
                  const msg = (document.getElementById('broadcastMessage') as HTMLTextAreaElement).value;
                  if (!msg) {
                    toast.error("Message cannot be empty!");
                    return;
                  }
                  
                  setConfirmModal({
                    isOpen: true,
                    message: "Are you sure you want to broadcast this message to all users?",
                    onConfirm: async () => {
                      const { data: allUsers } = await supabase.from('users').select('id');
                      if (!allUsers || allUsers.length === 0) {
                        toast.error("No users found");
                        setConfirmModal(null);
                        return;
                      }
                      
                      const notifications = allUsers.map((u: any) => ({
                        user_id: u.id,
                        type: 'system_broadcast',
                        message: "📣 GigTic Official: " + msg
                      }));
                      
                      const { error } = await supabase.from('notifications').insert(notifications);
                      if (error) {
                        toast.error("Failed to broadcast: " + error.message);
                      } else {
                        toast.success(`Successfully sent to ${allUsers.length} users!`);
                        (document.getElementById('broadcastMessage') as HTMLTextAreaElement).value = '';
                      }
                      setConfirmModal(null);
                    }
                  });
                }}"""
content = content.replace(broadcast_old, broadcast_new)


# Add modal to AdminDashboardContent
content = content.replace("    </div>\n  );\n}\n\nexport default function AdminDashboard()", modal_jsx + "    </div>\n  );\n}\n\nexport default function AdminDashboard()")

with open('apps/admin/app/page.tsx', 'w') as f:
    f.write(content)

