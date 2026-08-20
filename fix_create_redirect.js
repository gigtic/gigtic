const fs = require('fs');
const file = 'apps/web/app/create/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const \{ error \} = await supabase\.from\("jobs"\)\.insert\(jobData\);\n\s*if \(error\) throw error;\n\s*router\.push\("\/explore"\);/g,
  `const { data: newJob, error } = await supabase.from("jobs").insert(jobData).select('id').single();
        if (error) throw error;
        router.push(\`/success?id=\${newJob.id}\`);`
);

fs.writeFileSync(file, code);
