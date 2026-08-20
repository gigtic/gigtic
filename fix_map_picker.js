const fs = require('fs');
const file = 'apps/web/components/MapPicker.tsx';
let code = fs.readFileSync(file, 'utf8');

const effectCode = `
  useEffect(() => {
    if (initialCoordinates && initialCoordinates[0] !== 0) {
      setCenter(initialCoordinates);
    }
  }, [initialCoordinates?.[0], initialCoordinates?.[1]]);
`;

code = code.replace(
  /const mapRef = useRef\(null\);/,
  'const mapRef = useRef(null);\n' + effectCode
);

fs.writeFileSync(file, code);
