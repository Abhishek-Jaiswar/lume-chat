import { User } from "../models/user.model";
import { NotFoundException, UnautorizedException } from "../utils/app-error";
import { LoginSchemaType, RegisterSchemaType } from "../validators/auth.validator";

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User allready exists.");

  const newUser = await User.create({
    ...body,
  });

  return newUser;
};


export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;

  const user = await User.findOne({ email });
  if (!user) throw new NotFoundException("User with this email not found.");

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnautorizedException("Invalid credentials");
  }

  return user;
};
  