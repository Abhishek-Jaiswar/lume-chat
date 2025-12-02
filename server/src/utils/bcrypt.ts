import bcrypt from "bcryptjs";

export const hashValue = async (value: string, salt: number = 10) => {
  return await bcrypt.hash(value, salt);
};

export const CompareValue = async (value: string, hashedValue: string) => {
  return await bcrypt.compare(value, hashedValue);
};
