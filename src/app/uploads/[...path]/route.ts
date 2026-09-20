import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchFileFromGitHub } from '@/lib/githubSync';

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
      // Secondary fallback location: /tmp/uploads (on Vercel / serverless)
      const tmpPath = path.join('/tmp', 'uploads', ...safeSegments);
      if (fs.existsSync(tmpPath) && fs.statSync(tmpPath).isFile()) {
        filePath = tmpPath;
      } else {
        // Tertiary fallback location: root uploads directory
        filePath = path.join(process.cwd(), 'uploads', ...safeSegments);
      }
    }

    let fileBuffer: Buffer | null = null;

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      fileBuffer = fs.readFileSync(filePath);
    } else {
      // Serverless Remote Fallback: Fetch directly from GitHub repository
      const repoRelPath = `public/uploads/${safeSegments.join('/')}`;
      fileBuffer = await fetchFileFromGitHub(repoRelPath);

      if (fileBuffer) {
        // Cache locally in /tmp/uploads for high-performance subsequent hits on this container
        try {
          const tmpDir = path.join('/tmp', 'uploads');
          if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
          }
          fs.writeFileSync(path.join(tmpDir, safeSegments[safeSegments.length - 1]), fileBuffer);
        } catch {}
      }
    }

    if (!fileBuffer) {
      console.warn(`[UPLOAD SERVE] File not found locally or remotely: ${safeSegments.join('/')}`);
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

    return new NextResponse(new Uint8Array(fileBuffer), {
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
