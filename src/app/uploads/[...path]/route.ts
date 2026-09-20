import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const rawSegments = params.path || [];
    if (rawSegments.length === 0) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Sanitize path segments to prevent directory traversal while preserving exact filenames
    const safeSegments = rawSegments.map((s) => path.basename(decodeURIComponent(s)));

    // Primary location: public/uploads
    let filePath = path.join(process.cwd(), 'public', 'uploads', ...safeSegments);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      // Secondary fallback location: root uploads directory
      filePath = path.join(process.cwd(), 'uploads', ...safeSegments);
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      console.warn(`[UPLOAD SERVE] File not found: ${safeSegments.join('/')}`);
      return new NextResponse('Image not found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
      '.avif': 'image/avif',
      '.ico': 'image/x-icon',
    };

    const contentType = mimeTypes[ext] || 'image/jpeg';
    const fileBuffer = fs.readFileSync(filePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[UPLOAD SERVE] Error serving file:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
