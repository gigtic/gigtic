const fs = require('fs');
const file = 'apps/web/app/explore/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /{index > 0 && index % 6 === 0 && \(\n\s*<motion\.div variants=\{itemVariants\} className="col-span-1 md:col-span-2 lg:col-span-3">\n\s*<\/motion\.div>\n\s*\)}/g,
  `{index > 0 && index % 8 === 0 && (
                  <motion.div variants={itemVariants} className="col-span-full py-2">
                    <AdsterraUnit />
                  </motion.div>
                )}`
);

fs.writeFileSync(file, code);
