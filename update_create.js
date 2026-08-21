const fs = require('fs');
let file = 'apps/web/app/create/page.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [landmark, setLandmark]')) {
  code = code.replace(
    /const \[isIncognito, setIsIncognito\] = useState\(false\);/,
    `const [isIncognito, setIsIncognito] = useState(false);\n  const [landmark, setLandmark] = useState("");`
  );
  
  code = code.replace(
    /if \(job\.exchange_preference\) setExchangePref\(job\.exchange_preference\);/,
    `if (job.exchange_preference) setExchangePref(job.exchange_preference);\n          if (job.landmark) setLandmark(job.landmark);`
  );

  code = code.replace(
    /is_urgent: isUrgent,/,
    `is_urgent: isUrgent,\n        landmark: landmark.trim() || null,`
  );

  const targetUI = `<div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Your Pincode</label>`;
                    
  const replaceUI = `<div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Local Area / Landmark <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} className="block w-full px-4 py-3 bg-gray-50/50 border border-indigo-100/50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium text-sm" placeholder="e.g. VIT South Gate, Koramangala..." maxLength={40} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Your Pincode</label>`;
                    
  code = code.replace(targetUI, replaceUI);
  fs.writeFileSync(file, code);
}
