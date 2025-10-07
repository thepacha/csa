# Sootio - AI Voice Transcription SaaS

A modern, full-stack AI-powered voice transcription service built with Next.js, Supabase, and OpenAI Whisper.

## Features

- 🎙️ **AI-Powered Transcription**: Uses OpenAI Whisper for high-accuracy transcription
- 🔐 **Authentication**: Secure user authentication with Supabase Auth
- 💳 **Subscription Management**: Tiered pricing with Stripe integration
- 📁 **File Upload**: Drag-and-drop file upload with progress tracking
- 🌍 **Multi-Language Support**: Supports 50+ languages with auto-detection
- 📊 **Dashboard**: Beautiful dashboard to manage transcriptions
- 🔒 **Secure**: Row-level security and encrypted file storage
- 📱 **Responsive**: Mobile-friendly design with modern UI

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **AI**: OpenAI Whisper API
- **Payments**: Stripe
- **File Storage**: Supabase Storage
- **UI Components**: Radix UI, Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sootio
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_PRO_PRICE_ID=your_stripe_pro_price_id
   STRIPE_ENTERPRISE_PRICE_ID=your_stripe_enterprise_price_id
   ```

4. **Set up Supabase**
   
   Run the migration file in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
   ```

   Set up Storage bucket:
   - Create a new bucket called `audio-files`
   - Set it to public if you want direct file access, or private for more security

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── transcribe/    # Transcription endpoint
│   │   └── upload/        # File upload endpoint
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   └── file-upload.tsx   # File upload component
├── lib/                  # Utility functions
│   ├── constants.ts      # App constants
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
├── supabase/            # Database migrations
└── public/              # Static assets
```

## Usage

### For Users

1. **Sign Up**: Create an account using email or Google OAuth
2. **Upload Audio**: Drag and drop audio files or click to browse
3. **Transcribe**: Wait for AI processing (usually takes seconds)
4. **Manage**: View, edit, and download your transcriptions
5. **Upgrade**: Purchase credits or upgrade to higher tiers

### Supported File Formats

- MP3, WAV, AAC, OGG, WEBM, FLAC, M4A, MP4
- File size limits based on subscription tier:
  - Free: 25MB
  - Pro: 100MB  
  - Enterprise: 500MB

### Subscription Tiers

- **Free**: 100 minutes, basic accuracy, 25MB files
- **Pro**: 1000 minutes, high accuracy, 100MB files, priority support
- **Enterprise**: 10000 minutes, highest accuracy, 500MB files, API access

## API Reference

### Upload File
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: Audio file
- title: Optional custom title
```

### Transcribe Audio
```
POST /api/transcribe
Content-Type: multipart/form-data

Body:
- file: Audio file
- transcriptionId: ID from upload response
- language: Language code (optional, defaults to auto-detect)
- prompt: Custom prompt (optional)
```

### Get Transcriptions
```
GET /api/upload?page=1&limit=10&status=completed
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@sootio.com or join our Discord community.

## Roadmap

- [ ] Real-time transcription
- [ ] Speaker diarization
- [ ] Custom vocabulary
- [ ] API access
- [ ] Bulk processing
- [ ] Integration webhooks
- [ ] Mobile app
- [ ] Advanced analytics

---

Built with ❤️ using Next.js, Supabase, and OpenAI