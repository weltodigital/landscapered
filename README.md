# Gardenly SaaS - AI-Powered Garden Design & Quoting Platform

A modern SaaS application for landscapers to transform garden photos into professional design concepts and accurate quotes using AI-powered tools.

## 🌿 Features

### Core Functionality
- **Photo Upload**: Upload 1-3 garden photos for analysis
- **AI Design Generation**: Generate 3-5 design concepts in different styles (Modern, Cottage, Luxury, Low-Maintenance, etc.)
- **Element Extraction**: Automatically extract design elements (patio, turf, pergola, lighting, etc.) from AI-generated designs
- **Quote Generation**: Create detailed quotes with line items based on extracted elements and custom rates
- **PDF Export**: Generate professional, branded quote PDFs for clients

### User Management
- **Authentication**: Secure email/password authentication with NextAuth
- **Organization Setup**: Create and manage landscaping business organizations
- **Rate Card Management**: Configure pricing for materials, labor, and overhead costs

### Project Management
- **Project Dashboard**: Track all garden design projects in one place
- **Client Information**: Store and manage client details and project requirements
- **Project Status**: Track progress from draft through to quoted and accepted

## 🏗️ Tech Stack

- **Framework**: Next.js 16 with App Router and TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **PDF Generation**: @react-pdf/renderer
- **AI Services**: Mock implementation (ready for real AI API integration)
- **Validation**: Zod schema validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gardenly-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the local database**
   ```bash
   npx prisma dev
   ```
   This will start a local PostgreSQL server on ports 51213-51215.

4. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the database with demo data**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

After seeding, you can login with:
- **Email**: demo@gardenly.com
- **Password**: demo123

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   │   ├── auth/          # NextAuth configuration
│   │   ├── projects/      # Project management APIs
│   │   ├── designs/       # Design concept and element APIs
│   │   ├── quotes/        # Quote generation and PDF APIs
│   │   ├── organisations/ # Organization management
│   │   └── rate-card/     # Rate card management
│   ├── app/               # Main application pages (authenticated)
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── app-sidebar.tsx   # Main navigation
├── lib/                   # Utility libraries and services
│   ├── ai/               # Mock AI services
│   ├── auth.ts           # NextAuth configuration
│   ├── auth-utils.ts     # Authentication utilities
│   ├── prisma.ts         # Database client
│   ├── quotes/           # Quote generation logic
│   └── pdf/              # PDF template and generation
├── types/                 # TypeScript type definitions
└── styles/               # Global styles
prisma/
├── schema.prisma         # Database schema
├── migrations/           # Database migrations
└── seed.ts              # Demo data seeding script
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (already configured for local development):

```env
# Database
DATABASE_URL="prisma+postgres://localhost:51213/..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

### Database Schema

The application uses a comprehensive schema with the following main entities:

- **User**: User accounts and authentication
- **Organisation**: Landscaping business organizations
- **RateCard & RateItem**: Pricing configuration
- **Project**: Garden design projects
- **GardenPhoto**: Uploaded garden images
- **DesignConcept**: AI-generated design variations
- **DesignElement**: Extracted design components
- **Quote & QuoteLineItem**: Generated quotes and pricing

## 🤖 AI Integration

### Current Implementation

The application includes mock AI services that simulate:

1. **Design Generation**: Creates realistic design concepts based on garden styles
2. **Element Extraction**: Automatically identifies design elements from concepts
3. **Placeholder Images**: Uses Unsplash images for design previews

### Production Integration

To integrate with real AI services, update the files in `src/lib/ai/`:

**For Image Generation:**
- Replace mock functions in `gardenDesignService.ts`
- Integrate with OpenAI DALL-E, Midjourney, or similar APIs
- Update image URLs to actual generated content

**For Element Extraction:**
- Implement computer vision APIs (OpenAI Vision, Google Cloud Vision)
- Replace mock element detection with real image analysis
- Fine-tune element recognition for garden/landscape features

### Example Integration Points

```typescript
// src/lib/ai/gardenDesignService.ts

// Replace this mock function:
export async function generateDesignConcepts(projectId: string, styles: string[]) {
  // Current: Returns mock data
  // Production: Call OpenAI API, Replicate, etc.
}

// Replace this mock function:
export async function extractDesignElements(designConceptId: string) {
  // Current: Returns mock elements
  // Production: Analyze generated images with computer vision
}
```

## 📊 Database Management

### Migrations

Create new migration after schema changes:
```bash
npx prisma migrate dev --name description
```

### Generate Prisma Client

After schema changes:
```bash
npx prisma generate
```

### Reset Database

To reset and reseed:
```bash
npx prisma migrate reset
```

### Database Studio

View and edit data:
```bash
npx prisma studio
```

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Seed database
npm run db:seed

# Reset database and reseed
npx prisma migrate reset
```

## 🚀 Deployment

### Production Environment Setup

1. **Database**: Set up PostgreSQL (Supabase, Neon, or AWS RDS)
2. **Environment**: Configure production environment variables
3. **AI Services**: Integrate real AI APIs for image generation and analysis
4. **File Storage**: Implement cloud storage for uploaded images (S3, Cloudinary)

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-a-secure-secret"

# Add AI service keys
OPENAI_API_KEY="your-openai-key"
REPLICATE_API_TOKEN="your-replicate-token"

# Add file storage keys
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
```

### Deployment Options

- **Vercel**: Easiest deployment with automatic CI/CD
- **Netlify**: Alternative with similar features
- **AWS/GCP/Azure**: For custom infrastructure requirements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is for demonstration purposes. Please check licensing requirements for production use.

## 🆘 Support

For issues and questions:

1. Check the GitHub Issues page
2. Review the documentation
3. Contact the development team

---

Built with ❤️ for the landscaping industry. Transform your garden design process with AI-powered tools.
