import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest){
    const formData = await req.formData();
    const file = formData.get("file");

    if(!file) return NextResponse.json({error: "No file uploaded"}, {status: 400});

    const bytes = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "uploads");
    if(!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }

    const filePath = path.join(uploadDir, (file as File).name);
    fs.writeFileSync(filePath, buffer);

    const video = await prisma.video.create({
        data:{
            filePath: filePath,
        },
    });

    return NextResponse.json({success:true, video}, {status: 201});
}