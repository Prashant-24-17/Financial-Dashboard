const dotenv = require("dotenv");
const app = require("./app");
const connectDb = require("./config/db");
const seedDemoData = require("./utils/seedDemoData");

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDb();
  await seedDemoData();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
