const fs = require('fs');
const file = 'apps/admin/utils/supabase/middleware.ts';
let code = fs.readFileSync(file, 'utf8');

const oldCheck = `  // Security: Only allow specific admin emails to access the admin portal
  const ADMIN_EMAILS = ['unigig.official@gmail.com', 'vineethbpawar@gmail.com'];
  if (user && !ADMIN_EMAILS.includes(user.email || '')) {
    // If a regular user somehow logs in, immediately block them with a 403 Forbidden
    return new NextResponse(
      '403 Forbidden - You do not have administrator access to this portal.', 
      { status: 403 }
    )
  }`;

const newCheck = `  // Security: Only allow specific admin emails to access the admin portal
  if (user) {
    const masterAdmins = ['vineethbpawar@gmail.com', 'gigtic.official@gmail.com', 'keepsmilling64@gmail.com'];
    const { data: isAdmin } = await supabase.rpc('check_admin_access');
    
    if (!masterAdmins.includes((user.email || '').toLowerCase()) && !isAdmin) {
      // If a regular user somehow logs in, immediately block them with a 403 Forbidden
      return new NextResponse(
        '403 Forbidden - You do not have administrator access to this portal.', 
        { status: 403 }
      )
    }
  }`;

code = code.replace(oldCheck, newCheck);
fs.writeFileSync(file, code);
