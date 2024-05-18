const mongoose = require("mongoose");
const { DB_NAME } = require("../constants");

const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URI}/${DB_NAME}`
    );

    console.log(
      `Database Connection Established on Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`Database Connection Failed. ERROR: ${error.message}`);
  }
};

module.exports = dbConnect;
