import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get('key');
  const width = searchParams.get('width') || '160';
  const height = searchParams.get('height') || '300';

  if (!key) {
    return new Response('Missing ad key', { status: 400 });
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            background: transparent; 
            overflow: hidden; 
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${key}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${key}/invoke.js"></script>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      // Allow it to be embedded in iframes on the same origin
      'X-Frame-Options': 'SAMEORIGIN',
      // Prevent caching so Adsterra registers fresh views
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
