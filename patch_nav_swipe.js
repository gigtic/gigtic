const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add Framer Motion import
if (!code.includes("import { motion }")) {
    code = code.replace(
        'import toast from "react-hot-toast";',
        'import toast from "react-hot-toast";\nimport { motion } from "framer-motion";'
    );
}

// Replace toast with toast.custom and motion.div
const oldToast = /toast\(\s*\(\s*t\s*\)\s*=>\s*\(\s*<div\s*onClick=\{[\s\S]*?\{ duration: 5000, position: 'top-center' \}\s*\);/;

const newToast = `toast.custom(
               (t) => (
                 <motion.div 
                   drag="x"
                   dragConstraints={{ left: -100, right: 100 }}
                   onDragEnd={(e, info) => {
                     if (info.offset.x > 50 || info.offset.x < -50) {
                       toast.dismiss(t.id);
                     }
                   }}
                   onClick={() => {
                     toast.dismiss(t.id);
                     if (urlPart) window.location.href = urlPart;
                   }}
                   style={{
                     opacity: t.visible ? 1 : 0,
                     transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                     transition: 'opacity 0.3s, transform 0.3s',
                   }}
                   className={\`flex items-center gap-3 w-[300px] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl \${urlPart ? 'cursor-pointer hover:bg-slate-800' : ''}\`}
                 >
                   <div className="bg-indigo-600/30 p-2 rounded-full shrink-0">🔔</div>
                   <span className="font-semibold text-sm leading-tight select-none">{latest.message}</span>
                 </motion.div>
               ),
               { duration: 5000, position: 'top-center', id: latest.id }
             );`;

code = code.replace(oldToast, newToast);
fs.writeFileSync(file, code);
