const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const connectDB = require("../config/db");
const Admin = require("../models/Admin");
const { sanitizeText } = require("../utils/validation");

dotenv.config();

function readSeedInput() {
  const cliUsername = String(process.argv[2] || "").trim();
  const cliPassword = String(process.argv[3] || "").trim();

  return {
    username: cliUsername || String(process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || "").trim(),
    password: cliPassword || String(process.env.ADMIN_PASSWORD || "").trim(),
  };
}

async function main() {
  const { username, password } = readSeedInput();
  const normalizedUsername = sanitizeText(username).toLowerCase();

  if (!normalizedUsername || !password) {
    throw new Error(
      "Provide username/password via CLI or .env. Example: npm run seed:admin -- admin MyStrongPass123!"
    );
  }

  await connectDB();

  const hashedPassword = await bcrypt.hash(password, 12);

  await Admin.findOneAndUpdate(
    { username: normalizedUsername },
    {
      username: normalizedUsername,
      password: hashedPassword,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log("Admin user created/updated successfully.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
