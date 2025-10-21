# Caffeine Tracker

A modern web application for tracking caffeine intake across different time periods. Monitor your daily caffeine consumption, visualize patterns, and generate printable reports.

![Caffeine Tracker Screenshot](screenshot.png)

## Features

- **Period Management**: Create and manage different tracking periods (weeks, months, custom ranges)
- **Quick Log**: Fast logging with customizable drink buttons
- **Custom Entries**: Add custom drinks with specific caffeine amounts and timestamps
- **Bulk Import**: Import multiple drink entries at once via CSV-style input
- **Visual Analytics**:
  - Daily intake charts with bar graphs
  - Weekly calendar view showing drink tallies
  - Caffeine meter with daily intake visualization
  - Statistics dashboard with averages and totals
- **Printable Reports**: Generate printer-friendly reports for any period
- **Period Hiding**: Hide periods from the selector while preserving data
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Built-in theme toggle for comfortable viewing

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI primitives, shadcn/ui design system
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Routing**: Wouter
- **Build Tools**: Vite, esbuild

## Quick Start

### Prerequisites

- Node.js 20.x or newer
- PostgreSQL 14+ installed and running

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd CaffeineTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database and user
   sudo -u postgres psql << EOF
   CREATE DATABASE caffeine_tracker;
   CREATE USER caffeine_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE caffeine_tracker TO caffeine_user;
   \c caffeine_tracker
   GRANT ALL ON SCHEMA public TO caffeine_user;
   EOF
   ```

4. **Configure environment variables**

   Create a `.env` file in the project root:
   ```env
   DATABASE_URL=postgresql://caffeine_user:your_password@localhost:5432/caffeine_tracker
   PGHOST=localhost
   PGPORT=5432
   PGUSER=caffeine_user
   PGPASSWORD=your_password
   PGDATABASE=caffeine_tracker
   SESSION_SECRET=your_random_session_secret_min_32_chars
   NODE_ENV=development
   PORT=5000
   ```

   Generate a secure session secret:
   ```bash
   openssl rand -base64 32
   ```

5. **Initialize database schema**
   ```bash
   npm run db:push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to `http://localhost:5000`

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build frontend and backend for production
- `npm run start` - Run production build
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes to PostgreSQL

## Project Structure

```
CaffeineTracker/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions and config
│   │   └── pages/       # Page components
│   └── index.html       # HTML entry point
├── server/              # Backend Express application
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database operations
├── shared/              # Shared TypeScript types and schema
│   └── schema.ts        # Drizzle ORM schema definitions
└── db/                  # Database files (SQLite for local dev)
```

## Deployment

For detailed production deployment instructions on Ubuntu servers with Cloudflare Tunnels, see [UBUNTU_DEPLOYMENT.md](UBUNTU_DEPLOYMENT.md).

Quick deployment overview:
1. Set up Ubuntu server with Node.js 20+ and PostgreSQL
2. Clone repository and install dependencies
3. Configure production environment variables
4. Build application: `npm run build`
5. Run with systemd service: `npm run start`
6. Set up Cloudflare Tunnel for HTTPS access

## Usage

### Creating Periods

1. Navigate to the "Manage Periods" tab
2. Click "Add Period" and specify name, start date, and end date
3. Periods appear in the selector dropdown

### Logging Drinks

**Quick Log**: Click any of the customizable drink buttons on the home screen

**Custom Entry**:
1. Click "Custom Drink"
2. Enter drink name, caffeine amount, date, and time
3. Submit to log

**Bulk Import**:
1. Click "Bulk Import"
2. Paste CSV data with format: `Drink Name, Caffeine (mg), Date, Time`
3. Submit to import all entries

### Viewing Statistics

- **Current Period Stats**: Displayed on the tracker tab for selected period
- **Yearly Stats**: View in the stats tab for full year analytics
- **Charts**: Daily intake bar chart and weekly calendar view
- **Caffeine Meter**: Visual gauge showing today's intake

### Customizing Quick Drinks

1. Navigate to the "Settings" tab
2. Edit existing drink names and caffeine amounts
3. Add new drinks (up to 6 total)
4. Remove drinks with the × button
5. Reset to defaults if needed

Changes are saved automatically to browser localStorage.

## Data Management

### Hiding Periods

Hide periods from the dropdown selector without deleting data:
1. Go to "Manage Periods" tab
2. Toggle "Show hidden" switch to view hidden periods
3. Click the eye icon to hide/show a period

### Printing Reports

1. Select a period from the dropdown
2. Click the printer icon
3. Review the printable report
4. Use browser's print dialog to print or save as PDF

## License

MIT License - see package.json for details

## Support

For issues or questions:
- Check application logs in browser console
- Review the troubleshooting section in [UBUNTU_DEPLOYMENT.md](UBUNTU_DEPLOYMENT.md) for deployment issues
- Ensure all environment variables are correctly configured

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request
