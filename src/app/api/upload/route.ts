import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const IS_VERCEL = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
    const uploadDir = IS_VERCEL
      ? path.join('/tmp', 'uploads')
      : path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle JSON Base64 data URL upload
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { dataUrl, fileName: userFileName } = body;

      if (!dataUrl || typeof dataUrl !== 'string') {
        return NextResponse.json({ error: 'No data URL provided' }, { status: 400 });
      }

      // Check if it's a data URL
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
      }

      const mime = matches[1].toLowerCase();
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      let ext = '.png';
      if (mime.includes('svg')) ext = '.svg';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('gif')) ext = '.gif';

      const cleanBase = userFileName
        ? path.basename(userFileName, path.extname(userFileName)).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase()
        : 'logo';
      const fileName = `${cleanBase}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
        fileName,
      });
    }

    // Handle Multipart Form Data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate MIME type and file extension
    const validMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/svg+xml',
      'image/svg',
      'image/gif',
      'image/x-icon',
      'image/vnd.microsoft.icon',
    ];
    const fileExt = (path.extname(file.name) || '').toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg', '.gif', '.ico'];

    const isValid =
      (file.type && validMimes.includes(file.type.toLowerCase())) ||
      validExts.includes(fileExt);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, SVG, WEBP, JPEG, and GIF are supported.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = fileExt || (file.type.includes('svg') ? '.svg' : '.png');
    const cleanBase =
      path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() || 'upload';
    const fileName = `${cleanBase}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
