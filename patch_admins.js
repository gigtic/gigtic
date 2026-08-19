const fs = require('fs');
const file = 'apps/admin/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldArray = `    const masterAdmins = [
      "vineethbpawar@gmail.com",
      "keepsmilling64@gmail.com",
      "unigig.official@gmail.com"
    ];`;

const newArray = `    const masterAdmins = [
      "vineethbpawar@gmail.com",
      "gigtic.official@gmail.com",
      "keepsmilling64@gmail.com"
    ];`;

code = code.replace(oldArray, newArray);
fs.writeFileSync(file, code);
