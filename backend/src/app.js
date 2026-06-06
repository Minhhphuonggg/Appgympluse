const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const apiRoutes = require("./routes");
const { sendSuccess } = require("./utils/response");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  return sendSuccess(res, {
    message: "Server is running",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
