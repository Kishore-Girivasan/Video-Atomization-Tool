import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = Number(searchParams.get("videoId"));

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  const segments = await prisma.transcriptSegment.findMany({
    where: { videoId },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json({ segments });
}
    