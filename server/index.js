const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const settingsRoutes = require("./routes/settings");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const testRoutes = require("./routes/test");
const saveRoutes = require("./routes/save");
const likeRoutes = require("./routes/like");
const importsRoutes = require("./routes/imports");
const planRoutes = require("./routes/plan");
const groceryRoutes = require("./routes/grocery");
const pantryRoutes = require("./routes/pantry");

const app = express();

app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN,
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:4173",
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/test", testRoutes);
app.use("/", saveRoutes);
app.use("/", likeRoutes);
app.use("/imports", importsRoutes);
app.use("/plan", planRoutes);
app.use("/grocery", groceryRoutes);
app.use("/pantry", pantryRoutes);
app.use("/settings", settingsRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

module.exports = app;