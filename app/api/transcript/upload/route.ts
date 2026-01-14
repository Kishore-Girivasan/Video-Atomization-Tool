import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function timeToSeconds(time: string) {
  const [h, m, s] = time.replace(",", ".").split(":");
  return Math.floor(Number(h) * 3600 + Number(m) * 60 + Number(s));
}

function parseSRT(srt: string) {
  const blocks = srt.split("\n\n");
  const segments = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    if (lines.length < 3) continue;

    const timeLine = lines[1];
    const text = lines.slice(2).join(" ");

    const [start, end] = timeLine.split(" --> ");

    segments.push({
      startTime: timeToSeconds(start),
      endTime: timeToSeconds(end),
      text,
    });
  }

  return segments;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const videoId = Number(formData.get("videoId"));

  if (!file || !videoId) {
    return NextResponse.json({ error: "Missing file or videoId" }, { status: 400 });
  }

  const content = await file.text();
  const segments = parseSRT(content);

  for (const seg of segments) {
    await prisma.transcriptSegment.create({
      data: {
        videoId,
        startTime: seg.startTime,
        endTime: seg.endTime,
        text: seg.text,
      },
    });
  }

  return NextResponse.json({
    success: true,
    count: segments.length,
  });
}
