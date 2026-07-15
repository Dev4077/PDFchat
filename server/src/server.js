const fs = require("fs");
const path = require("path");
const { app } = require("./app");
const { env } = require("./config/env");
const { connectDb } = require("./config/db");
const { seedCreditPacks } = require("./services/pack-seed.service");

async function bootstrap() {
  const uploadPath = path.resolve("uploads");
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  await connectDb();
  const seedResult = await seedCreditPacks();
  if (seedResult.seeded) {
    // eslint-disable-next-line no-console
    console.log(`Seeded ${seedResult.count} credit packs`);
  }

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
