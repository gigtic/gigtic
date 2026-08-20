const fs = require('fs');
const file = 'apps/web/app/explore/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Change Grid to grid-cols-2 on mobile
code = code.replace(
  /className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"/g,
  'className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5"'
);

// 2. Replace the entire card motion.div content
const startMarker = '<motion.div \n                  variants={itemVariants}\n                  className="group bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col h-full overflow-hidden relative"\n                >';
const endMarker = '</motion.div>';

const startIndex = code.indexOf(startMarker);
// Find the closing </motion.div> for this card. We have to be careful with nested motion.divs, 
// but looking at the file, the next </motion.div> is the one we want.
if (startIndex !== -1) {
  let innerIndex = startIndex + startMarker.length;
  let nextClose = code.indexOf('</motion.div>', innerIndex);
  
  const newCard = `
                <motion.div 
                  variants={itemVariants}
                  className="group bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col h-full overflow-hidden"
                >
                  <Link href={\`/job/\${job.id}\`} className="flex-1 flex flex-col cursor-pointer">
                    {/* Badge Row */}
                    <div className="flex items-center justify-between mb-2">
                      {job.is_urgent ? (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-black uppercase tracking-wider border border-rose-100">
                          SOS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-bold border border-gray-100">
                          {job.category}
                        </span>
                      )}
                      {job.service_mode === 'Physical' ? (
                        <span className="text-[10px] text-gray-400" title="Physical">📍</span>
                      ) : (
                        <span className="text-[10px] text-gray-400" title="Digital">💻</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-[13px] md:text-sm font-bold text-gray-900 mb-1.5 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    
                    {/* Price */}
                    <div className="mt-auto mb-2">
                      <span className="text-sm font-black text-gray-900">₹{job.budget_amount}</span>
                    </div>
                  </Link>

                  {/* Footer User Row */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <Link href={\`/user/\${job.requester_id}\`} className="flex items-center gap-2 overflow-hidden hover:opacity-80">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                        {job.users?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] md:text-xs font-bold text-gray-900 truncate">{job.users?.username || "Anon"}</p>
                        <p className="text-[9px] font-bold text-orange-500 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" /> {job.users?.trust_score || 100}
                        </p>
                      </div>
                    </Link>
                  </div>
                </motion.div>
  `;
  
  code = code.substring(0, startIndex) + newCard.trim() + code.substring(nextClose + '</motion.div>'.length);
  fs.writeFileSync(file, code);
  console.log("Successfully replaced card UI");
} else {
  console.log("Could not find start marker.");
}
