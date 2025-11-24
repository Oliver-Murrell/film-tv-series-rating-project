const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const axios = require("axios");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to fetch data from OMDb API using a title
async function fetchMedia(title) {
  const res = await axios.get("http://www.omdbapi.com/", {
    params: {
      apikey: process.env.OMDB_API_KEY,
      t: title,
    },
  });
  return res.data;
}

// GET all media from the database
router.get("/", async (req, res) => {
  const sort = req.query.sort || "created_at";
  // const order = sort === "rating" ? "DESC" : "DESC";
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const offset = (page - 1) * limit;

  // Get total count for pagination
  const countResult = await pool.query("SELECT COUNT(*) FROM media");
  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / limit);

  // Get paginated results
  const result = await pool.query(
    `SELECT * FROM media ORDER BY ${sort} DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const mediaWithSummary = await Promise.all(
    result.rows.map(async (item) => {
      let summary = "";
      let posterUrl = "";
      if (item.imdb_id) {
        try {
          const omdbRes = await axios.get("http://www.omdbapi.com/", {
            params: {
              apikey: process.env.OMDB_API_KEY,
              i: item.imdb_id,
            },
          });
          if (omdbRes.data) {
            if (omdbRes.data.Plot && omdbRes.data.Plot !== "N/A") {
              summary = omdbRes.data.Plot;
            }
            if (omdbRes.data.Poster && omdbRes.data.Poster !== "N/A") {
              posterUrl = omdbRes.data.Poster;
            }
          }
        } catch (e) {
          summary = "";
          posterUrl = "";
        }
      }
      return { ...item, summary, posterUrl };
    })
  );

  res.render("mediaList", {
    media: mediaWithSummary,
    page,
    totalPages,
  });
});

// GET form to add new media
router.get("/new", (req, res) => {
  res.render("mediaForm");
});

// POST add new media
router.post("/new", async (req, res) => {
  const { title, rating, review } = req.body;

  try {
    const data = await fetchMedia(title);

    if (data.Response === "False") throw new Error("Media not found");

    await pool.query(
      "INSERT INTO media (title, type, year, rating, review, imdb_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [data.Title, data.Type, data.Year, rating, review, data.imdbID]
    );
    res.redirect("/media");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching media info.");
  }
});

// GET form to edit existing media
router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM media WHERE id = $1", [id]);
  res.render("mediaEdit", { media: result.rows[0] });
});

// POST update media entry
router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;
  await pool.query("UPDATE media SET rating = $1, review = $2 WHERE id = $3", [
    rating,
    review,
    id,
  ]);
  res.redirect("/media");
});

// POST delete media
router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM media WHERE id = $1", [id]);
  res.redirect("/media");
});

// GET search suggestions for search-as-you-type
router.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const result = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: process.env.OMDB_API_KEY,
        s: query,
      },
    });

    const suggestions = result.data.Search?.map((item) => item.Title) || [];
    res.json(suggestions);
  } catch (err) {
    console.error("OMDb search failed:", err.message);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
