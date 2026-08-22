const fs = require('fs');
const file = 'apps/admin/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Update state definition in AdminDashboardContent
code = code.replace(
    'const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);',
    'const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: (val?: number) => void, withInput?: boolean, inputValue?: number} | null>(null);'
);

// 2. Update handleConfirmPenalize
const oldHandle = `const handleConfirmPenalize = async (report: any) => {
    setConfirmModal({
      isOpen: true,
      message: \`Confirm penalize? This will deduct 20 points from @\${report.reported?.username || 'user'}.\`,
      onConfirm: async () => {`;

const newHandle = `const handleConfirmPenalize = async (report: any) => {
    setConfirmModal({
      isOpen: true,
      withInput: true,
      inputValue: 20,
      message: \`How many Trust Score points do you want to deduct from @\${report.reported?.username || 'user'} for this report?\`,
      onConfirm: async (penaltyAmount = 20) => {`;

code = code.replace(oldHandle, newHandle);

// 3. Update the penalty amount logic inside handleConfirmPenalize
const oldPenalty = `const newScore = Math.max(0, (userData.trust_score || 0) - 20);
          
          const { error: penaltyError } = await supabase
            .from('users')
            .update({ trust_score: newScore })
            .eq('id', report.reported_id);
            
          if (penaltyError) throw penaltyError;
          
          await supabase.from('notifications').insert([{
            user_id: report.reported_id,
            message: \`⚠️ Your account has been penalized 20 trust score points due to a confirmed report against you.\`
          }]);`;

const newPenalty = `const newScore = Math.max(0, (userData.trust_score || 0) - penaltyAmount);
          
          const { error: penaltyError } = await supabase
            .from('users')
            .update({ trust_score: newScore })
            .eq('id', report.reported_id);
            
          if (penaltyError) throw penaltyError;
          
          if (penaltyAmount > 0) {
            await supabase.from('notifications').insert([{
              user_id: report.reported_id,
              message: \`⚠️ Your account has been penalized \${penaltyAmount} trust score points due to a confirmed report against you.\`
            }]);
          }`;

code = code.replace(oldPenalty, newPenalty);

// 4. Update the render of confirmModal inside AdminDashboardContent
// First, find the right confirm modal block inside AdminDashboardContent
// It's at the end of AdminDashboardContent just before "export default function AdminDashboard"
const oldModalJSX = `{/* Confirm Modal */}
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
      )}`;

const newModalJSX = `{/* Confirm Modal */}
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
              {confirmModal.withInput && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Points to Deduct</label>
                  <input 
                    type="number" 
                    min="0"
                    defaultValue={confirmModal.inputValue}
                    id="penalty-input"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setConfirmModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const input = document.getElementById('penalty-input');
                    const val = input ? parseInt((input as HTMLInputElement).value) : undefined;
                    confirmModal.onConfirm(val);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}`;

// We need to replace only the LAST instance of Confirm Modal, because the first one is inside ReviewsAdminTab
const lastIndex = code.lastIndexOf('{/* Confirm Modal */}');
if (lastIndex !== -1) {
  code = code.substring(0, lastIndex) + newModalJSX + code.substring(lastIndex + oldModalJSX.length);
}

fs.writeFileSync(file, code);
