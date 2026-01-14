import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { videoId, startTime, endTime, title } = body;

  if (
    typeof videoId !== "number" ||
    typeof startTime !== "number" ||
    typeof endTime !== "number"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
  });

  if (!video)
    return NextResponse.json({ error: "Video not found" }, { status: 404 });

  const inputPath = video.filePath;
  const outputDirectory = path.join(process.cwd(), "clips");

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  const baseName = `clip_${videoId}_${Date.now()}`;

  const horizontalPath = path.join(outputDirectory, `${baseName}_h.mp4`);
  const verticalPath = path.join(outputDirectory, `${baseName}_v.mp4`);

  const duration = endTime - startTime;

  // Horizontal clip
  const horizontalCmd = `ffmpeg -y -i "${inputPath}" -ss ${startTime} -t ${duration} -c copy "${horizontalPath}"`;

  // Vertical clip (9:16 crop)
  const verticalCmd = `ffmpeg -y -i "${inputPath}" -ss ${startTime} -t ${duration} -vf "crop=ih*9/16:ih" "${verticalPath}"`;

  try {
    await execPromise(horizontalCmd);
    await execPromise(verticalCmd);
  } catch (err) {
    console.error("ffmpeg error:", err);
    return NextResponse.json(
      { error: "Failed to generate clips" },
      { status: 500 }
    );
  }

  const horizontalClip = await prisma.clip.create({
    data: {
      videoId: video.id,
      startTime,
      endTime,
      title: title || "Untitled clip",
      orientation: "horizontal",
      filePath: horizontalPath,
    },
  });

  const verticalClip = await prisma.clip.create({
    data: {
      videoId: video.id,
      startTime,
      endTime,
      title: title || "Untitled clip",
      orientation: "vertical",
      filePath: verticalPath,
    },
  });

  return NextResponse.json({
    success: true,
    clips: [horizontalClip, verticalClip],
  });
}

function execPromise(command: string) {
  return new Promise<void>((resolve, reject) => {
    exec(command, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
