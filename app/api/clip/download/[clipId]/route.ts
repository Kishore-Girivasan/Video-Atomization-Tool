import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clipId: string }> }
) {
  const { clipId } = await params;
  const id = parseInt(clipId);

  const clip = await prisma.clip.findUnique({ where: { id } });

  if (!clip || !fs.existsSync(clip.filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(clip.filePath);

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="clip_${id}.mp4"`,
    },
  });
}
