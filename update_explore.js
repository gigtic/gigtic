const fs = require('fs');
let file = 'apps/web/app/explore/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add landmark to interface
code = code.replace(
  /is_urgent: boolean;/,
  `is_urgent: boolean;\n  landmark?: string;`
);

// Add landmark to UI
const target = `{/* Price */}`;
const replacement = `{/* Landmark */}
                    {job.landmark && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="text-[10px] md:text-[11px] text-gray-500 font-bold truncate">{job.landmark}</span>
                      </div>
                    )}
                    
                    {/* Price */}`;
code = code.replace(target, replacement);
fs.writeFileSync(file, code);
