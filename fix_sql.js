const fs = require('fs');
let code = fs.readFileSync('setup_reports.sql', 'utf8');

// Replace the invalid users.role check with the correct admin check
const badAdminCheck = /EXISTS \(\s*SELECT 1 FROM public\.users\s*WHERE users\.id = auth\.uid\(\) AND users\.role = 'ADMIN'\s*\)/g;

const goodAdminCheck = `(auth.jwt() ->> 'email' IN ('vineethbpawar@gmail.com', 'gigtic.official@gmail.com', 'keepsmilling64@gmail.com', 'hello@gigtic.in') OR EXISTS (SELECT 1 FROM public.admin_whitelist WHERE admin_whitelist.email = auth.jwt() ->> 'email'))`;

code = code.replace(badAdminCheck, goodAdminCheck);

fs.writeFileSync('setup_reports.sql', code);
fs.writeFileSync('setup_reports.txt', code);
