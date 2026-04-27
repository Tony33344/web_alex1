import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: filePath } = await params;
  const emailPath = path.join(process.cwd(), 'emails', ...filePath);
  
  try {
    const fileContent = fs.readFileSync(emailPath, 'utf-8');
    return NextResponse.json({ content: fileContent });
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: filePath } = await params;
  const emailPath = path.join(process.cwd(), 'emails', ...filePath);
  const { content } = await request.json();
  
  try {
    fs.writeFileSync(emailPath, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
