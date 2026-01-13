"use client";

import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const [videoId, setVideoId] = useState<number | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingClip, setLoadingClip] = useState(false);

  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [title, setTitle] = useState<string>("");

  async function upload() {
    if (!file) return;

    setLoadingUpload(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setVideoId(data.video.id);
      setMessage("✅ Upload successful!");
    } else {
      setMessage("❌ Upload failed");
    }

    setLoadingUpload(false);
  }

  async function createClip() {
    if (!videoId) return;

    setLoadingClip(true);
    setMessage("");

    const response = await fetch("/api/clip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId,
        startTime,
        endTime,
        title,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setMessage("✅ Clip created successfully!");
    } else {
      setMessage("❌ Clip creation failed");
    }

    setLoadingClip(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex justify-center items-start p-8">
      <div className="w-full max-w-2xl space-y-8">

        <h1 className="text-3xl font-bold">🎬 Poseidon Video Tool</h1>

        {/* Upload Card */}
        <div className="bg-gray-900 rounded-xl p-6 space-y-4 shadow-lg">
          <h2 className="text-xl font-semibold">1. Upload Video</h2>

          <input
            type="file"
            accept="video/*"
            className="block w-full text-sm text-gray-300
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-600 file:text-white
                       hover:file:bg-blue-700"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            onClick={upload}
            disabled={loadingUpload}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loadingUpload ? "Uploading..." : "Upload"}
          </button>

          {videoId && (
            <p className="text-green-400">Video uploaded. ID: {videoId}</p>
          )}
        </div>

        {/* Clip Card */}
        {videoId && (
          <div className="bg-gray-900 rounded-xl p-6 space-y-4 shadow-lg">
            <h2 className="text-xl font-semibold">2. Create Clip</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400">Start (sec)</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">End (sec)</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Title</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={createClip}
              disabled={loadingClip}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loadingClip ? "Creating..." : "Create Clip"}
            </button>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
