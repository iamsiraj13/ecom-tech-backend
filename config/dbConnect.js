const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    mongoose.connect(process.env.DB_URL);
    console.log("Database Connect Successfull");
  } catch (error) {
    console.log("Database Connect Failed");
  }
};

module.exports = dbConnect;
