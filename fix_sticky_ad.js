const fs = require('fs');
let layoutPath = 'apps/web/app/layout.tsx';
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

const target = `<Navigation />`;

const replacement = `<Navigation />
        <AdsterraMobileSticky adKey="b8e48a108a8fec93539050d2bb525545" />`;

layoutCode = layoutCode.replace(target, replacement);

fs.writeFileSync(layoutPath, layoutCode);
