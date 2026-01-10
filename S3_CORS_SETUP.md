# S3 CORS Configuration Required

## The Problem
Your upload is failing with "Failed to fetch" because your S3 bucket doesn't allow direct uploads from the browser. This is a CORS (Cross-Origin Resource Sharing) security restriction.

## The Solution
Add the CORS configuration below to your S3 bucket.

---

## How to Configure CORS on AWS S3

### Step 1: Go to AWS S3 Console
1. Log in to [AWS Console](https://console.aws.amazon.com/s3/)
2. Click on your bucket name (the one in your `.env` file as `AWS_S3_BUCKET_NAME`)

### Step 2: Navigate to Permissions
1. Click the **"Permissions"** tab
2. Scroll down to **"Cross-origin resource sharing (CORS)"**
3. Click **"Edit"**

### Step 3: Add This Configuration

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://yourdomain.com",
            "https://www.yourdomain.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-request-id"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### Step 4: Update AllowedOrigins
**IMPORTANT:** Replace `"https://yourdomain.com"` with your actual domains:
- Your production domain (e.g., `https://rasmanpeter.com`)
- Any preview/staging domains (e.g., `https://rasman-*.vercel.app`)
- Keep `http://localhost:3000` for local development

Example:
```json
"AllowedOrigins": [
    "http://localhost:3000",
    "https://rasmanpeter.com",
    "https://www.rasmanpeter.com",
    "https://rasman-git-main-yourusername.vercel.app",
    "https://*.vercel.app"
]
```

### Step 5: Save Changes
1. Click **"Save changes"**
2. Wait a few seconds for the configuration to propagate

---

## What This Does

- **AllowedHeaders**: Allows all headers (needed for Content-Type, etc.)
- **AllowedMethods**: Allows GET (download), PUT (upload), POST, DELETE, HEAD
- **AllowedOrigins**: Domains that can access your S3 bucket
- **ExposeHeaders**: Headers the browser can read from S3 responses
- **MaxAgeSeconds**: How long the browser caches CORS settings

---

## Testing

After adding the CORS configuration:

1. **Wait 1-2 minutes** for changes to propagate
2. Go to your upload page: `/admin/upload`
3. Select **"Direct S3 Upload"** method
4. Try uploading a file
5. Check browser console (F12) for detailed logs

---

## Troubleshooting

### Still getting "Failed to fetch"?

1. **Verify your domain** is in AllowedOrigins
   - Check the URL in your browser address bar
   - Make sure it exactly matches (including `https://` vs `http://`)

2. **Check browser console** for CORS errors:
   - Press F12
   - Go to Console tab
   - Look for red error messages mentioning "CORS" or "Access-Control-Allow-Origin"

3. **Try Traditional Upload** instead:
   - Select "Traditional Upload" method
   - This bypasses CORS (uploads through your API)
   - Limited to 4.5MB but works immediately

4. **Verify CORS was saved**:
   - Go back to S3 → Permissions → CORS
   - Make sure your configuration is still there

---

## Using Wildcards (Advanced)

If you deploy to multiple Vercel preview URLs, you can use wildcards:

```json
"AllowedOrigins": [
    "http://localhost:3000",
    "https://rasmanpeter.com",
    "https://*.vercel.app"
]
```

**Note:** Some S3 regions don't support wildcards in CORS. If this doesn't work, list each domain explicitly.

---

## Security Note

The CORS configuration only allows browsers from specific domains to upload to your S3 bucket. This is safe because:

1. ✅ Presigned URLs expire in 1 hour
2. ✅ URLs are single-use only
3. ✅ Generated server-side with admin authentication
4. ✅ Only specific file paths can be uploaded
5. ✅ Your AWS credentials never leave the server

---

## Alternative: Use Traditional Upload

If you can't configure CORS right now:

1. Compress your files to under 4.5MB
2. Use **"Traditional Upload"** method
3. This uploads through your Vercel function (no CORS needed)
4. Set up CORS later when you need to upload larger files

---

## Need Help?

If you're still having issues:
1. Share the exact error from browser console
2. Confirm your CORS configuration is saved
3. Verify which domain you're accessing from
