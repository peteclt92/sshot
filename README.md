# SShot - Simple Screenshot Sharing

A minimalistic webapp for uploading screenshots and getting instant shareable links.

## Features

- 📤 Drag & drop or click to upload screenshots
- 📋 Automatic clipboard copy on upload
- 📜 Accordion history view
- 🗑️ Delete all functionality
- ✨ Delightful, modern UI with smooth animations
- ☁️ Direct client uploads to Vercel Blob (bypasses 4.5MB function limit)

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Vercel Blob Storage

## Deployment

This app is designed to be deployed on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variable in Vercel dashboard:
   - `BLOB_READ_WRITE_TOKEN` - Get this from Vercel Blob dashboard
4. Deploy automatically

### Setting up Vercel Blob

1. Go to your Vercel project dashboard
2. Navigate to Storage → Blob
3. Create a new Blob store
4. Copy the `BLOB_READ_WRITE_TOKEN` to your environment variables

## Local Development

```bash
npm install
npm run dev
```

Create a `.env.local` file with:
```
BLOB_READ_WRITE_TOKEN=your_token_here
```

Visit `http://localhost:3000`
