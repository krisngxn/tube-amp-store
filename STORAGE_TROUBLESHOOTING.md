# Storage Upload Troubleshooting

## Common Issues and Solutions

### Error: "Failed to upload image to storage"

This error typically occurs due to one of the following issues:

#### 1. Storage Bucket Doesn't Exist

**Solution**: Create the bucket in Supabase Dashboard:

1. Go to **Storage** → **Buckets** in your Supabase Dashboard
2. Click **New bucket**
3. Set:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **Enabled** (important!)
   - **File size limit**: 10MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

#### 2. Service Role Key Not Set

**Solution**: Check your `.env.local` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

To get your service role key:
1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy the **service_role** key (not the anon key!)
3. Add it to `.env.local`

**Important**: Never commit this key to git!

#### 3. Bucket Policies Not Configured

**Solution**: Set up storage policies in Supabase SQL Editor:

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow service role to upload (handled via API routes)
-- The service role key bypasses RLS, so no policy needed for INSERT
```

#### 4. Storage Quota Exceeded

**Solution**: Check your Supabase project storage quota:
1. Go to **Settings** → **Usage** in Supabase Dashboard
2. Check if you've exceeded your storage limit
3. Upgrade plan or delete old files if needed

#### 5. File Size Too Large

**Solution**: The current limit is 10MB. Either:
- Compress the image before uploading
- Increase the bucket file size limit in Supabase Dashboard

#### 6. Invalid File Type

**Solution**: Only these formats are allowed:
- JPEG/JPG
- PNG
- WebP

Convert your image to one of these formats.

## Debugging Steps

1. **Check Browser Console**: Open DevTools → Console to see detailed error messages
2. **Check Network Tab**: Open DevTools → Network, find the failed request, and check the response
3. **Check Server Logs**: Look at your terminal/console where Next.js is running for server-side errors
4. **Verify Environment Variables**: Make sure `.env.local` has:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Testing the Setup

You can test if the bucket exists and is accessible by running this in Supabase SQL Editor:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'product-images';

-- List files in bucket (if any)
SELECT * FROM storage.objects WHERE bucket_id = 'product-images';
```

## Still Having Issues?

1. Check the error details in the browser console - the improved error handling now shows:
   - Error message
   - Error code
   - Storage path
   - Bucket name

2. Verify your Supabase project is active and not paused

3. Make sure you're using the correct Supabase project (check `NEXT_PUBLIC_SUPABASE_URL`)

4. Try uploading a small test image (under 1MB) to rule out size issues

