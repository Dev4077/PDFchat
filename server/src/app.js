const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { apiRoutes } = require("./routes");
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
