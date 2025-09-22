# Database Configuration

## PostgreSQL Setup

This project uses PostgreSQL as the database with Prisma ORM.

### Prerequisites

1. Install PostgreSQL on your system
2. Create a database named `webfestival_db`
3. Update the `DATABASE_URL` in your `.env.local` file

### Environment Variables

Copy `.env.example` to `.env.local` and update the database connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/webfestival_db"
```

### Database Commands

- Generate Prisma client: `npm run db:generate`
- Push schema to database: `npm run db:push`
- Run migrations: `npm run db:migrate`
- Open Prisma Studio: `npm run db:studio`

### Schema Overview

The database includes the following main entities:

- **Users**: Authentication and user management
- **Festivals**: Main festival entities
- **Events**: Individual events within festivals
- **Media**: Image and video management
- **Posts**: Social media content management

### First Time Setup

1. Ensure PostgreSQL is running
2. Create the database: `createdb webfestival_db`
3. Run: `npm run db:push` to create tables
4. Optionally run: `npm run db:studio` to view the database