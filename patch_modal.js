const fs = require('fs');
const file = 'apps/admin/app/users/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add toast and X icon
code = code.replace(
  'import { Loader2, ArrowLeft, ShieldAlert, CheckCircle2, User, Briefcase, IndianRupee, Activity, Shield, Mail } from "lucide-react";',
  'import { Loader2, ArrowLeft, ShieldAlert, CheckCircle2, User, Briefcase, IndianRupee, Activity, Shield, Mail, X } from "lucide-react";\nimport { toast } from "react-hot-toast";'
);

// Add modal state
code = code.replace(
  'const [stats, setStats] = useState({',
  'const [actionModal, setActionModal] = useState<{isOpen: boolean, type: "status" | "delete", targetStatus?: string} | null>(null);\n  const [reasonInput, setReasonInput] = useState("");\n  const [isActionLoading, setIsActionLoading] = useState(false);\n  const [stats, setStats] = useState({'
);

// Replace updateUserStatus and deleteUser
const oldFuncs = /const updateUserStatus = async[\s\S]*?const deleteUser = async[\s\S]*?alert\("Failed: " \+ error\.message\);\n    }\n  };/;
const newFuncs = `const executeAction = async () => {
    if (!reasonInput.trim()) return toast.error("Reason is required.");
    setIsActionLoading(true);

    if (actionModal?.type === 'status' && actionModal.targetStatus) {
      const { error } = await supabase.rpc("admin_update_user_status", {
        target_user_id: user.id,
        new_status: actionModal.targetStatus,
        reason: reasonInput,
      });
      if (!error) {
        setUser({ ...user, account_status: actionModal.targetStatus, status_reason: reasonInput });
        const actionText = actionModal.targetStatus === "SUSPENDED" ? "suspended" : actionModal.targetStatus === "BANNED" ? "blocked" : "reactivated";
        await supabase.from("notifications").insert([{ user_id: user.id, message: \`⚠️ Security Alert: Your account has been \${actionText} by the GigTic Admin. Reason: \${reasonInput}\` }]);
        toast.success("User status updated successfully.");
        setActionModal(null);
        setReasonInput("");
      } else {
        toast.error("Failed: " + error.message);
      }
    } else if (actionModal?.type === 'delete') {
      const { error } = await supabase.rpc("admin_delete_user", { target_user_id: user.id, reason: reasonInput });
      if (!error) {
        toast.success("User deleted successfully.");
        router.push("/?tab=user_management");
      } else {
        toast.error("Failed: " + error.message);
      }
    }
    setIsActionLoading(false);
  };`;

code = code.replace(oldFuncs, newFuncs);

// Update buttons
code = code.replace('onClick={() => updateUserStatus("BANNED")}', 'onClick={() => setActionModal({ isOpen: true, type: "status", targetStatus: "BANNED" })}');
code = code.replace('onClick={() => updateUserStatus("SUSPENDED")}', 'onClick={() => setActionModal({ isOpen: true, type: "status", targetStatus: "SUSPENDED" })}');
code = code.replace('onClick={() => updateUserStatus("ACTIVE")}', 'onClick={() => setActionModal({ isOpen: true, type: "status", targetStatus: "ACTIVE" })}');
code = code.replace('onClick={deleteUser}', 'onClick={() => setActionModal({ isOpen: true, type: "delete" })}');

// Add modal JSX at bottom
const modalJsx = `
      {/* Action Modal */}
      {actionModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                {actionModal.type === 'delete' ? 'Delete User' : \`Change Status to \${actionModal.targetStatus}\`}
              </h3>
              <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Please provide a clear reason for this administrative action. This will be visible to the user.
              </p>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g. Violating community guidelines..."
                className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 text-sm resize-none"
              ></textarea>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setActionModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                  Cancel
                </button>
                <button 
                  onClick={executeAction}
                  disabled={isActionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2"
                >
                  {isActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace('    </div>\n  );\n}', modalJsx);

fs.writeFileSync(file, code);
