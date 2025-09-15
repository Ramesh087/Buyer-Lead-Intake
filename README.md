# Buyer Lead Intake App

A full-stack Next.js application for managing real estate buyer leads with authentication, CRUD operations, CSV import/export, and comprehensive validation.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd buyer-lead-intake-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database and authentication details

# Set up the database
npm run db:generate
npm run db:migrate
npm run db:seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── buyers/            # Buyer management pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
│   ├── db/               # Database schema and connection
│   ├── auth/             # Authentication logic
│   └── validations/      # Zod schemas
├── migrations/           # Database migrations
└── public/              # Static assets
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Magic link authentication
- **Validation:** Zod
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **State Management:** React Server Components + Server Actions

## 📊 Database Schema

### Buyers Table
- `id` (UUID, Primary Key)
- `fullName` (String, 2-80 chars)
- `email` (String, optional, valid email)
- `phone` (String, 10-15 digits, required)
- `city` (Enum: Chandigarh|Mohali|Zirakpur|Panchkula|Other)
- `propertyType` (Enum: Apartment|Villa|Plot|Office|Retail)
- `bhk` (Enum: 1|2|3|4|Studio, conditional)
- `purpose` (Enum: Buy|Rent)
- `budgetMin` (Integer, INR, optional)
- `budgetMax` (Integer, INR, optional)
- `timeline` (Enum: 0-3m|3-6m|>6m|Exploring)
- `source` (Enum: Website|Referral|Walk-in|Call|Other)
- `status` (Enum: New|Qualified|Contacted|Visited|Negotiation|Converted|Dropped)
- `notes` (Text, ≤1000 chars, optional)
- `tags` (String array, optional)
- `ownerId` (UUID, Foreign Key)
- `updatedAt` (Timestamp)

### Buyer History Table
- `id` (UUID, Primary Key)
- `buyerId` (UUID, Foreign Key)
- `changedBy` (UUID, Foreign Key)
- `changedAt` (Timestamp)
- `diff` (JSON, changed fields)

## ✨ Key Features

### 🔐 Authentication
- Magic link authentication
- User session management
- Protected routes and API endpoints

### 📝 Lead Management
- **Create Lead** (`/buyers/new`)
  - Comprehensive form with validation
  - Conditional BHK field for residential properties
  - Real-time client and server-side validation
  
- **List & Search** (`/buyers`)
  - Server-side rendering with pagination (10 per page)
  - URL-synced filters (city, propertyType, status, timeline)
  - Debounced search by name, phone, email
  - Sortable columns with default sort by updatedAt desc

- **View & Edit** (`/buyers/[id]`)
  - Detailed view with edit capabilities
  - Optimistic concurrency control
  - Change history tracking (last 5 changes)

### 📁 Import/Export
- **CSV Import**
  - Batch import up to 200 rows
  - Row-by-row validation with error reporting
  - Transactional processing (all or nothing)
  - Preview before import

- **CSV Export**
  - Export filtered/searched results
  - Respects current table state
  - All fields included

### 🔒 Security & Validation

#### Client-Side Validation
- Zod schemas for all forms
- Real-time field validation
- User-friendly error messages

#### Server-Side Validation
- All API endpoints protected with Zod validation
- Ownership checks (users can only edit their own leads)
- Rate limiting on create/update operations
- CSRF protection

#### Data Integrity
- Database constraints and foreign keys
- Transactional operations
- Optimistic concurrency control

## 🎯 Validation Rules

### Form Validation
- `fullName`: Minimum 2 characters, maximum 80
- `email`: Valid email format (optional)
- `phone`: Numeric, 10-15 digits (required)
- `budgetMax`: Must be ≥ `budgetMin` when both present
- `bhk`: Required only for Apartment/Villa property types
- `notes`: Maximum 1000 characters
- `tags`: Array of strings

### Business Rules
- Users can only edit/delete their own leads
- Admin users can manage all leads (optional role)
- Status transitions are tracked in history
- All enum values are strictly validated

## 🏃‍♂️ Performance Optimizations

### Server-Side Rendering
- All list pages use SSR for SEO and performance
- Real pagination with database-level LIMIT/OFFSET
- Efficient database queries with proper indexing

### Client-Side Optimizations
- Debounced search (300ms delay)
- Optimistic updates for better UX
- Lazy loading for non-critical components

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- Form validation logic
- CSV import/export functions
- Database operations
- Authentication flows

## ♿ Accessibility

- Semantic HTML structure
- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Error announcements

## 🔧 Development

### Environment Variables
Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/buyer_leads"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (for magic links)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@yourapp.com"
```

### Database Commands

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Reset database (caution: deletes all data)
npm run db:reset

# Open database studio
npm run db:studio
```

### Code Quality

- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

## 📈 Monitoring & Error Handling

### Error Boundaries
- Global error boundary for unhandled errors
- Page-level error boundaries
- Graceful degradation

### Logging
- Server-side error logging
- User action tracking
- Performance monitoring

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# Configure PostgreSQL database (Supabase recommended)
```

### Docker
```bash
# Build Docker image
docker build -t buyer-lead-app .

# Run with Docker Compose
docker-compose up
```

## 🔄 API Endpoints

### Buyers
- `GET /api/buyers` - List buyers with filters
- `POST /api/buyers` - Create new buyer
- `GET /api/buyers/[id]` - Get buyer details
- `PUT /api/buyers/[id]` - Update buyer
- `DELETE /api/buyers/[id]` - Delete buyer

### Import/Export
- `POST /api/buyers/import` - CSV import
- `GET /api/buyers/export` - CSV export

### Authentication
- `POST /api/auth/signin` - Magic link signin
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

## 📋 Nice-to-Have Features (Implemented)

1. **Tag Management**
   - Typeahead search for existing tags
   - Tag chips with easy removal
   - Auto-suggestion based on previous entries

2. **Quick Status Updates**
   - Dropdown in table for quick status changes
   - Batch status updates for multiple leads

3. **Advanced Search**
   - Full-text search across name, email, and notes
   - Search highlighting in results
   - Saved search filters

## 🐛 Known Issues & Limitations

- CSV import limited to 200 rows per batch
- Rate limiting is basic (can be enhanced with Redis)
- No real-time updates (consider WebSockets for team collaboration)
- File upload for attachments not implemented (can be added)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Drizzle team for the type-safe ORM
- Shadcn for the beautiful UI components
- Zod for runtime type validation

---

**Built with ❤️ for real estate professionals**