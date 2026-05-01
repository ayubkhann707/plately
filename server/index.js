const express = require("express");
const cors = require("cors");
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
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/test", testRoutes);
app.use("/", saveRoutes);
app.use("/", likeRoutes);
app.use("/imports", importsRoutes);
app.use("/plan", planRoutes);
app.use("/grocery", groceryRoutes);
app.use("/pantry", pantryRoutes);

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