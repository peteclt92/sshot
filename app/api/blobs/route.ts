import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list();
    
    const uploads = blobs.map(blob => ({
      url: blob.url,
      filename: blob.pathname,
      timestamp: new Date(blob.uploadedAt).getTime(),
    }));

    return NextResponse.json(uploads);
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ error: 'Failed to list uploads' }, { status: 500 });
  }
}
