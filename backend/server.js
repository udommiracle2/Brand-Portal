require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectDB } = require("./db");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const dashboardRoutes = require("./routes/dashboard");
const profileRoutes = require("./routes/profile");
const { uploadDir } = require("./middleware/upload");

if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
  console.error(
    "\nMissing JWT_SECRET.\n" +
      "Create a backend/.env file (copy .env.example to .env) and set JWT_SECRET to a long random string, then restart the server.\n"
  );
  process.exit(1);
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

// Central error handler (e.g. multer file-type/size errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong." });
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error(`\nCouldn't connect to MongoDB Atlas: ${err.message}\n`);
    console.error(
      "Check that MONGODB_URI in backend/.env is correct, that your current IP is allowed " +
        "in Atlas Network Access, and that the database user's credentials are right.\n"
    );
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Brand portal API running on http://localhost:${PORT}`);
  });
}

start();
