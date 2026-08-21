const fs = require('fs');
const file = 'apps/admin/app/users/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const updateStatusPattern = /const updateUserStatus = async[^{]*{([^}]|}[^;])*alert\("Failed to update status."\);\s*}\s*};/m;
const updateStatusNew = `const updateUserStatus = async (status: string) => {
    if (!confirm(\`Are you sure you want to change this user's status to \${status}?\`)) return;
    
    const reason = window.prompt("Reason for action:");
    if (reason === null) return; // User cancelled

    const { error } = await supabase.rpc("admin_update_user_status", {
      target_user_id: user.id,
      new_status: status,
      reason: reason,
    });
    
    if (!error) {
      setUser({ ...user, account_status: status, status_reason: reason });
      const actionText =
        status === "SUSPENDED" ? "suspended" : status === "BANNED" ? "blocked" : "reactivated";
      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          message: \`⚠️ Security Alert: Your account has been \${actionText} by the GigTic Admin. Reason: \${reason}\`,
        },
      ]);
      alert("User status updated successfully.");
    } else {
      alert("Failed to update status.");
    }
  };`;

const deleteUserPattern = /const deleteUser = async[^{]*{([^}]|}[^;])*alert\("Failed to delete user."\);\s*}\s*};/m;
const deleteUserNew = `const deleteUser = async () => {
    if (
      !confirm(
        "Are you sure you want to completely permanently delete this user profile? This cannot be undone."
      )
    )
      return;
      
    const reason = window.prompt("Reason for action:");
    if (reason === null) return; // User cancelled

    const { error } = await supabase.rpc("admin_delete_user", { 
      target_user_id: user.id,
      reason: reason
    });
    
    if (!error) {
      alert("User deleted successfully.");
      router.push("/?tab=user_management");
    } else {
      alert("Failed to delete user.");
    }
  };`;

code = code.replace(updateStatusPattern, updateStatusNew);
code = code.replace(deleteUserPattern, deleteUserNew);

fs.writeFileSync(file, code);
