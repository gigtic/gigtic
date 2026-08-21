const fs = require('fs');
let file = 'apps/web/app/job/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add landmark UI
const target = `<div className="rounded-2xl overflow-hidden border border-indigo-100/50 pointer-events-none">`;
const replacement = `{job.landmark && (
                <div className="mb-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Landmark / Area</p>
                    <p className="text-sm font-semibold text-slate-800">{job.landmark}</p>
                  </div>
                </div>
              )}
              <div className="rounded-2xl overflow-hidden border border-indigo-100/50 pointer-events-none">`;
              
code = code.replace(target, replacement);
fs.writeFileSync(file, code);
