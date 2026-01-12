"use client";

import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  async function upload(){
    if(!file) return;

    const formData = new FormData();
    formData.append("file",file);

    const response = await fetch("api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setMessage(JSON.stringify(data));
  }

  return(
    <div>
      <h1>Upload Video</h1>
      <input type="file" accept="video/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
      <button onClick={upload} className="">Upload</button>
      <pre>{message}</pre>
    </div>
  )
}