const fs = require('fs');
const file = 'apps/web/components/MapPicker.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `        (error) => {
          toast.error("Could not detect location. Please tap on the map.");
        }`;

const newCode = `        (error) => {
          let msg = "Could not detect location. Please tap on the map.";
          if (error.code === error.PERMISSION_DENIED) msg = "Location permission denied by browser settings.";
          else if (error.code === error.POSITION_UNAVAILABLE) msg = "GPS unavailable. Please turn on device location.";
          else if (error.code === error.TIMEOUT) msg = "Location request timed out.";
          toast.error(msg);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
