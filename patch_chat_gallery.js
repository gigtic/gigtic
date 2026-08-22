const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldInput = `<label className="cursor-pointer p-2 shrink-0 text-gray-400 hover:text-indigo-500 transition-colors">\n                <Camera className="w-5 h-5" />\n                <input \n                  type="file" \n                  accept="image/jpeg,image/png,image/webp" \n                  className="hidden" \n                  onChange={handleImageUpload}\n                  disabled={isSubmitting}\n                />\n              </label>`;

const newInput = `<label className="cursor-pointer p-2 pr-1 shrink-0 text-gray-400 hover:text-indigo-500 transition-colors" title="Take Photo">\n                <Camera className="w-5 h-5" />\n                <input \n                  type="file" \n                  accept="image/jpeg,image/png,image/webp" \n                  capture="environment"\n                  className="hidden" \n                  onChange={handleImageUpload}\n                  disabled={isSubmitting}\n                />\n              </label>\n              <label className="cursor-pointer p-2 pl-1 shrink-0 text-gray-400 hover:text-indigo-500 transition-colors" title="Upload from Gallery">\n                <ImageIcon className="w-5 h-5" />\n                <input \n                  type="file" \n                  accept="image/jpeg,image/png,image/webp" \n                  className="hidden" \n                  onChange={handleImageUpload}\n                  disabled={isSubmitting}\n                />\n              </label>`;

code = code.replace(oldInput, newInput);
fs.writeFileSync(file, code);
