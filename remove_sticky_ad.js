const fs = require('fs');
let layoutPath = 'apps/web/app/layout.tsx';
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

layoutCode = layoutCode.replace(
  /<AdsterraMobileSticky adKey="b8e48a108a8fec93539050d2bb525545" \/>/g,
  ''
);

fs.writeFileSync(layoutPath, layoutCode);
