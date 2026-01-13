import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
    const body = await request.json();
    const { videoId, startTime, endTime, title } = body;

    if(typeof videoId !== "number" || typeof startTime !== "number" || typeof endTime !== "number") {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const video = await prisma.video.findUnique({
        where: { id: videoId },
    })

    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const inputPath = video.filePath;
    const outputDirectory = path.join(process.cwd(), "clips");

    if(!fs.existsSync(outputDirectory)){
        fs.mkdirSync(outputDirectory);
    }

    const fileName = `clip_${videoId}_${Date.now()}.mp4`;
    const outputPath = path.join(outputDirectory, fileName);

    const duration = endTime - startTime;

    const command = `ffmpeg -y -i "${inputPath}" -ss ${startTime} -t ${duration} -c copy "${outputPath}"`;

    try {
        await new Promise<void>((resolve, reject) => {
        exec(command, (error) => {
            if (error) reject(error);
            else resolve();
        });
        });
    } catch (err) {
        console.error("ffmpeg error:", err);
        return NextResponse.json(
        { error: "Failed to generate clip" },
        { status: 500 }
        );
    }

    const clip = await prisma.clip.create({
        data: {
        videoId: video.id,
        startTime,
        endTime,
        title: title || "Untitled clip",
        orientation: "horizontal",
        filePath: outputPath,
        },
    });

    return NextResponse.json({
        success: true,
        clip,
    });
}