import { NextResponse } from 'next/server';
import { readdir, unlink } from 'fs/promises';
import path from 'path';

export async function DELETE() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      const files = await readdir(uploadDir);
      await Promise.all(
        files.map(file => unlink(path.join(uploadDir, file)))
      );
      return NextResponse.json({ success: true, deleted: files.length });
    } catch {
      return NextResponse.json({ success: true, deleted: 0 });
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
