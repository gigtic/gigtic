const fs = require('fs');
const file = 'apps/web/app/onboarding/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove 'required' and 'maxLength={6}' requirement from pincode input
code = code.replace(/<input\s+type="text"\s+required\s+maxLength=\{6\}\s+value=\{pincode\}/, '<input\n                  type="text"\n                  maxLength={6}\n                  value={pincode}');

// 2. Change label to "Campus Pincode (Optional)"
code = code.replace(/<label className="block text-sm font-semibold text-gray-900">Campus Pincode<\/label>/, '<label className="block text-sm font-semibold text-gray-900">Campus Pincode <span className="text-gray-400 font-normal">(Optional, helps find area)</span></label>');

// 3. Change map label to make it clear it's required
code = code.replace(/<label className="block text-sm font-semibold text-gray-900">Pinpoint your precise location<\/label>/, '<label className="block text-sm font-semibold text-gray-900">Pinpoint your precise location <span className="text-red-500">*</span></label>');

// 4. Update the submit button disabled condition
// Old: disabled={loading || nickname.length < 3 || pincode.length !== 6 || !realName || !age || !phoneNumber}
// New: disabled={loading || nickname.length < 3 || !coordinates || !realName || !age || !phoneNumber}
code = code.replace(/disabled=\{loading \|\| nickname\.length < 3 \|\| pincode\.length !== 6 \|\| !realName \|\| !age \|\| !phoneNumber\}/, 'disabled={loading || nickname.length < 3 || !coordinates || !realName || !age || !phoneNumber}');

fs.writeFileSync(file, code);
