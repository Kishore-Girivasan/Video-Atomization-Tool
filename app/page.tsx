"use client";

import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [srtFile, setSrtFile] = useState<File | null>(null);
  const [videoId, setVideoId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [clips, setClips] = useState<any[]>([]);

  async function uploadVideo() {
    if (!file) return;

    setStatus("Uploading video...");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data?.video?.id) {
      setVideoId(data.video.id);
      setClips([]);
      setStatus("✅ Video uploaded successfully");
    } else {
      setStatus("❌ Video upload failed");
    }
  }

  async function uploadTranscript() {
    if (!srtFile || !videoId) {
      alert("Upload video first");
      return;
    }

    setStatus("Uploading transcript...");

    const formData = new FormData();
    formData.append("file", srtFile);
    formData.append("videoId", String(videoId));

    const res = await fetch("/api/transcript/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setStatus("✅ Transcript uploaded successfully");
    } else {
      setStatus("❌ Transcript upload failed");
    }
  }

  async function generateClips() {
    if (!videoId) {
      alert("Upload video and transcript first");
      return;
    }

    setStatus("Generating clips...");

    const res = await fetch(`/api/process/${videoId}`, {
      method: "POST",
    });

    const data = await res.json();

    if (data?.clips?.length > 0) {
      setStatus(`✅ Generated ${data.clips.length} clips`);
      await loadClips(videoId);
    } else {
      setStatus("❌ No clips generated");
    }
  }

  async function loadClips(videoId: number) {
    const res = await fetch(`/api/video/${videoId}/clips`);
    const data = await res.json();
    setClips(data.clips || []);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-gray-900 rounded-xl space-y-4 shadow-lg">

        <h1 className="text-xl font-bold text-center">🎬 Poseidon Video Tool</h1>

        {status && (
          <div className="text-center text-sm text-green-400">{status}</div>
        )}

        <div className="space-y-2">
          <label className="block text-sm">1. Upload Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-slate-700 file:text-white
              hover:file:bg-slate-600
              cursor:pointer"
          />
          <button
            onClick={uploadVideo}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded"
          >
            Upload Video
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm">2. Upload Transcript (SRT file format)</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-slate-700 file:text-white
              hover:file:bg-slate-600
              cursor:pointer"
          />
          <button
            onClick={uploadTranscript}
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded"
          >
            Upload Transcript
          </button>
        </div>

        <button
          onClick={generateClips}
          className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded"
        >
        Generate Clips
        </button>

        {clips.length > 0 && (
          <div className="space-y-2 pt-4">
            <h2 className="text-lg font-semibold">Generated Clips</h2>

            {clips.map((clip) => (
              <div
                key={clip.id}
                className="flex justify-between items-center bg-gray-800 p-3 rounded"
              >
                <div>
                  <p className="text-sm font-medium line-clamp-2">{clip.title}</p>
                  <p className="text-xs text-gray-400">{clip.orientation}</p>
                </div>

                <a
                  href={`/api/clip/download/${clip.id}`}
                  className="text-blue-400 hover:underline text-sm"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
