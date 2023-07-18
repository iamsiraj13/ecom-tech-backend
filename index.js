const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8000;

const authRoute = require("./routes/authRoute");
const bodyParser = require("body-parser");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

app.use("/api/user", authRoute);

app.use(errorHandler);
app.use(notFound);

app.listen(PORT, () => {
  dbConnect();
  console.log(`Server is running on ${PORT}`);
});
