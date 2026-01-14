This project demonstrates a complete backend pipeline for:
- Video upload
- Transcript ingestion (SRT)
- Automated clipping using ffmpeg
- Horizontal & vertical export
- Metadata storage using Postgres (Neon)
- Simple UI to drive the workflow


<br> **Setup:**

**Step 1:** Clone the repository <br>
 ```git clone https://github.com/your-username/poseidon-video-tool.git``` <br>
 ```cd poseidon-video-tool```

**Step 2:** Install dependencies <br>
 ```npm install```

**Step 3:** Setup environment variables <br>
Create a .env file in the root: <br>
```DATABASE_URL=your_postgres_or_neon_database_url```

**Step 4:** Setup the database <br>
```npx prisma generate``` <br>
```npx prisma db push```

**Step 5:** Install ffmpeg <br>
Make sure ffmpeg is installed and accessible in your system PATH.

**Check:**
```ffmpeg -version```

**Step 6:** Run the development server <br>
```npm run dev```


<br>**Architecture:**

- **Next.js (App Router):**
Used for both the frontend UI and backend API routes, keeping the entire system in a single unified codebase.

- **Frontend UI:**
Provides a simple interface to upload videos, upload transcripts, trigger clip generation, and download generated clips.

- **API Routes:**
Handles video upload, transcript ingestion, clip processing, and clip download through server-side endpoints.

- **PostgreSQL (Neon):**
Stores metadata such as videos, transcript segments, clips, timestamps, orientations, and file paths.

- **ffmpeg (Local Binary):**
Used for actual video processing to cut clips and generate both horizontal (16:9) and vertical (9:16) versions.

**Trade-off:**
- The system currently ingests pre-generated transcripts (SRT) instead of generating them using speech-to-text. This was done to keep the pipeline simple.
