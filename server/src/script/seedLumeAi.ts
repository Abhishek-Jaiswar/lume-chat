import "dotenv/config";
import { connectToDatabase } from "../config/database.config";
import { User } from "../models/user.model";

export const CreateLumeAi = async () => {
  let existingAi = await User.findOne({ isAi: true });
  if (existingAi) {
    console.log("Lume AI user already exists.");
    return existingAi;
  }

  existingAi = await User.create({
    name: "Lume AI",
    isAi: true,
    avatar:
      "https://res.cloudinary.com/deav9q9tn/image/upload/v1767567969/67263_fnsim4.jpg",
  });
  console.log("Lume AI user created.");
  return existingAi;
};

const seedLumeAi = async () => {
  try {
    await connectToDatabase();
    await CreateLumeAi();
    console.log("Seeding Lume AI completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding Lume AI:", error);
    process.exit(1);
  }
};

seedLumeAi();
