const fs = require('fs');
const file = 'apps/admin/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Restore the first one (ReviewsAdminTab)
code = code.replace(
    'const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: (val?: number) => void, withInput?: boolean, inputValue?: number} | null>(null);',
    'const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);'
);

// Update the second one (AdminDashboardContent)
// Wait, the second one is at line 209. Let's replace the FIRST instance of the OLD definition now (which will be at line 209).
code = code.replace(
    'const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);',
    'const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: (val?: number) => void, withInput?: boolean, inputValue?: number} | null>(null);'
);

// But wait, there are two `const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);` now?
// Let's just do a blanket replace for both to the new type to be safe.

fs.writeFileSync(file, code);
