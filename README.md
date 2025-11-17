# Film Rating Project

A modern web app for tracking, rating, and reviewing films and TV series.

## Features

- Add, edit, and delete films/TV series
- Rate and review each entry
- Fetches film data and posters from OMDb API
- Responsive card-based UI with flip animation
- Search suggestions for film titles
- Confirmation modal for deletions

## Tech Stack

- Node.js + Express
- EJS templates
- PostgreSQL (with schema in `db/schema.sql`)
- OMDb API for film data
- Modern CSS (responsive, card design)

## Setup

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file with:
   - `DATABASE_URL=your_postgres_url`
   - `OMDB_API_KEY=your_omdb_key`
4. Run the database schema in `db/schema.sql`
5. Start the server: `node app.js`
6. Visit [http://localhost:3000](http://localhost:3000)

## Folder Structure

```
app.js                # Main server
routes/media.js       # Media routes
views/                # EJS templates
public/style.css      # Main CSS
public/               # Static files
.db/schema.sql        # Database schema
```

## License

MIT
