# Caffeine Tracker Application

## Overview

This is a full-stack caffeine tracking application that allows users to monitor their daily caffeine intake across different time periods. Users can log drinks, view statistics, track consumption patterns, and generate printable reports. The application features a modern, productivity-focused design system inspired by tools like Notion and Linear, emphasizing data clarity and efficient interaction patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing (alternative to React Router)

**UI Component System:**
- Shadcn UI component library (New York style variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management
- Theme system supporting light/dark modes with localStorage persistence

**State Management:**
- TanStack Query (React Query) for server state management and caching
- Local React state for UI-specific interactions
- localStorage for persisting user preferences (quick-log drinks customization)
- Custom hooks pattern for reusable logic (e.g., `useIsMobile`, `useTheme`)

**Design System:**
- Custom color palette optimized for productivity and data visualization
- Typography using Inter (UI/body) and Manrope (display/stats) from Google Fonts
- Consistent spacing, border radius, and shadow system
- Print-optimized layouts for report generation

**Key Features:**
- Period-based tracking (users can create unlimited named tracking periods)
- Quick-log drink buttons with customizable preset caffeine amounts
- Custom drink logging with date/time picker for backdating entries
- Customizable quick-log drinks (stored in localStorage)
- Real-time statistics and visualizations (meters, charts, calendars)
- Monday-Friday calendar view showing drink tallies
- Daily caffeine meter (0-100%) with skull icon at maximum
- Printable reports using react-to-print library
- Toast notifications for user feedback

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript running on Node.js
- Custom middleware for request logging and error handling
- RESTful API design pattern

**Database & ORM:**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (via Neon serverless driver)
- Schema-first approach with Zod validation integrated via drizzle-zod

**Data Models:**
- `periods` table: Tracks time periods for caffeine monitoring (id, name, startDate, endDate)
- `drink_entries` table: Stores individual drink logs with caffeine amounts and timestamps (id, periodId, drinkName, caffeineAmount, timestamp)
- UUID-based primary keys for scalability
- Timestamps support both current time and backdated entries for importing history

**Development Strategy:**
- In-memory storage implementation (`MemStorage`) for development/testing
- Database storage layer abstraction via `IStorage` interface
- Easy swap between storage implementations

**API Endpoints:**
- `GET/POST /api/periods` - Manage tracking periods
- `PUT/DELETE /api/periods/:id` - Update/delete specific periods
- `GET/POST /api/drink-entries` - Log and retrieve drink entries
- `GET /api/drink-entries/period/:periodId` - Period-specific entries

### Development Environment

**Vite Integration:**
- Custom Vite setup with middleware mode for SSR-like development experience
- Replit-specific plugins for error overlay and development banner
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**Code Quality:**
- TypeScript strict mode enabled across the entire codebase
- ESM module system throughout (both client and server)
- Shared schema definitions between client and server via `@shared` alias

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Primary database service using `@neondatabase/serverless` driver
- **Connection Management**: Database URL via environment variable `DATABASE_URL`
- **Migrations**: Drizzle Kit for schema migrations in `./migrations` directory

### Third-Party Services & Libraries

**UI Component Libraries:**
- Radix UI suite (accordion, dialog, dropdown-menu, select, tabs, toast, etc.)
- Lucide React for iconography
- Embla Carousel for carousel functionality
- CMDK for command menu patterns

**Data & Forms:**
- React Hook Form with Hookform Resolvers for form validation
- Zod for schema validation and type inference
- Date-fns for date manipulation and formatting

**Utilities:**
- clsx & tailwind-merge for conditional class management
- nanoid for unique ID generation
- react-to-print for report printing functionality

**Development Tools:**
- Replit-specific Vite plugins for enhanced DX
- PostCSS with Tailwind CSS and Autoprefixer
- ESBuild for production server bundling

### Session Management
- Connect-pg-simple for PostgreSQL session storage (configured but implementation pending)

### Font Services
- Google Fonts CDN for Inter and Manrope typefaces (preconnected in HTML head)