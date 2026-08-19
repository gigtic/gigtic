const fs = require('fs');
const file = 'apps/web/components/PremiumUnlockButton.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldSmartlink = 'https://wistfulseverely.com/jbj3kv3x?key=aabe8cc65afab476bc8dad2377ca48a3';
const newSmartlink = 'https://www.effectivecpmnetwork.com/wa8nemaf?key=57fa9354e17d41554d4b666d8b564e3a';

code = code.replace(oldSmartlink, newSmartlink);

fs.writeFileSync(file, code);
