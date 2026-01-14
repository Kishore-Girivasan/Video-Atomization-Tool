import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const id = parseInt(videoId);

  const clips = await prisma.clip.findMany({
    where: { videoId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ clips });
}
