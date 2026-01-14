import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const id = parseInt(videoId);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid video id" }, { status: 400 });
  }

  const video = await prisma.video.findUnique({
    where: { id },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const segments = await prisma.transcriptSegment.findMany({
    where: { videoId: id },
    orderBy: { startTime: "asc" },
  });

  if (segments.length === 0) {
    return NextResponse.json({ error: "No transcript segments found" }, { status: 400 });
  }

  const clipsDir = path.join(process.cwd(), "clips");
  if (!fs.existsSync(clipsDir)) fs.mkdirSync(clipsDir);

  const createdClips = [];

  for (const segment of segments) {
    const duration = segment.endTime - segment.startTime;

    const hFile = `clip_${id}_${segment.id}_h.mp4`;
    const hPath = path.join(clipsDir, hFile);

    const vFile = `clip_${id}_${segment.id}_v.mp4`;
    const vPath = path.join(clipsDir, vFile);

    const cmdH = `ffmpeg -y -i "${video.filePath}" -ss ${segment.startTime} -t ${duration} -c copy "${hPath}"`;
    const cmdV = `ffmpeg -y -i "${video.filePath}" -ss ${segment.startTime} -t ${duration} -vf "crop=ih*9/16:ih" "${vPath}"`;

    await execPromise(cmdH);
    await execPromise(cmdV);

    const hClip = await prisma.clip.create({
      data: {
        videoId: id,
        startTime: segment.startTime,
        endTime: segment.endTime,
        title: segment.text || "Clip",
        orientation: "horizontal",
        filePath: hPath,
      },
    });

    const vClip = await prisma.clip.create({
      data: {
        videoId: id,
        startTime: segment.startTime,
        endTime: segment.endTime,
        title: segment.text || "Clip",
        orientation: "vertical",
        filePath: vPath,
      },
    });

    createdClips.push(hClip, vClip);
  }

  return NextResponse.json({
    success: true,
    clips: createdClips,
  });
}

function execPromise(cmd: string) {
  return new Promise<void>((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
