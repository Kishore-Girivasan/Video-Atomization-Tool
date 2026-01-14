This project demonstrates a complete backend pipeline for:
- Video upload
- Transcript ingestion (SRT)
- Automated clipping using ffmpeg
- Horizontal & vertical export
- Metadata storage using Postgres (Neon)
- Simple UI to drive the workflow

Setup steps:

Step 1: Clone the repository
git clone https://github.com/your-username/poseidon-video-tool.git
cd poseidon-video-tool

Step 2: Install dependencies
npm install

Step 3: Setup environment variables
Create a .env file in the root:
DATABASE_URL=your_postgres_or_neon_database_url

Step 4: Setup the database
npx prisma generate
npx prisma db push

Step 5: Install ffmpeg
Make sure ffmpeg is installed and accessible in your system PATH.

Check:
ffmpeg -version

Step 6: Run the development server
npm run dev

Architecture:
UI (Next.js)
   |
   |-- Upload Video
   |-- Upload Transcript (SRT)
   |-- Generate Clips
   |
API Routes
   |
   |-- /api/upload               → Saves video
   |-- /api/transcript/upload    → Parses SRT
   |-- /api/process/[videoId]    → Generates clips
   |-- /api/clip/download/[id]   → Downloads clip
   |
ffmpeg (local binary)
   |
Postgres (Neon)


Trade-off:
The system currently ingests pre-generated transcripts (SRT) instead of generating them using speech-to-text. This was done to keep the pipeline simple.
