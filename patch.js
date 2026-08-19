const fs = require('fs');
const file = 'apps/web/app/onboarding/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!code.includes('import dynamic from "next/dynamic"')) {
    code = code.replace(/import \{ useRouter \} from "next\/navigation";/, 'import { useRouter } from "next/navigation";\nimport dynamic from "next/dynamic";');
}
if (!code.includes('MapPicker')) {
    code = code.replace(/import toast from "react-hot-toast";/, 'import toast from "react-hot-toast";\n\nconst MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false, loading: () => <div className="w-full h-[300px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center font-bold text-gray-400">Loading Map...</div> });');
}

// 2. Add state
if (!code.includes('const [coordinates, setCoordinates]')) {
    code = code.replace(/const \[pincode, setPincode\] = useState\(""\);/, 'const [pincode, setPincode] = useState("");\n  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);');
}

// 3. Insert MapPicker component
if (!code.includes('<MapPicker')) {
    const mapStr = `
            <div className="space-y-1.5 mt-6">
              <label className="block text-sm font-semibold text-gray-900">Pinpoint your precise location</label>
              <MapPicker 
                pincode={pincode} 
                onLocationSelect={(lat, lng) => setCoordinates([lat, lng])} 
              />
            </div>
`;
    code = code.replace(/(<p className="text-xs text-gray-500 pt-1">Used anonymously to match you with nearby gigs\.<\/p>\s*<\/div>)/, '$1' + mapStr);
}

// 4. Update the insert statement
if (!code.includes('default_location:')) {
    code = code.replace(/is_contact_masked: isContactMasked,/, 'is_contact_masked: isContactMasked,\n      default_location: coordinates ? `POINT(${coordinates[1]} ${coordinates[0]})` : null,');
}

fs.writeFileSync(file, code);
