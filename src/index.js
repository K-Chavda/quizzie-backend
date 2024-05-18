const app = require("./app");
const dbConnect = require("./db/dbConnect");

dbConnect()
  .then((data) => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Database Connection Failed. ERROR: ${error.message}`);
  });
