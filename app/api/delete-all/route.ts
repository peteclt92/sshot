import { list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    const { blobs } = await list();
    
    if (blobs.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }

    await Promise.all(blobs.map(blob => del(blob.url)));
    
    return NextResponse.json({ success: true, deleted: blobs.length });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
