import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return new Response(JSON.stringify({ error: "filename and contentType are required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize S3 client for Cloudflare R2
    const s3 = new S3Client({
      region: "auto",
      endpoint: Deno.env.get("R2_ENDPOINT_URL")!, // e.g., https://<ACCOUNT_ID>.r2.cloudflarestorage.com
      credentials: {
        accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
        secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
      },
    });

    // Generate unique key to avoid collisions
    const fileKey = `${crypto.randomUUID()}-${filename}`;
    const bucketName = Deno.env.get("R2_BUCKET_NAME")!;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const publicUrl = `${Deno.env.get("R2_PUBLIC_URL")!}/${fileKey}`;

    return new Response(JSON.stringify({ signedUrl, publicUrl, fileKey }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
