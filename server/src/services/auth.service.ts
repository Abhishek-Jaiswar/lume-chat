import { User } from "../models/user.model";
import {
  InvalidCredentials,
  NotFoundException,
  UnautorizedException,
} from "../utils/app-error";
import {
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator";

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User allready exists.");

  const newUser = await User.create({
    name: body.name,
    email: body.email,
    password: body.password,
    avatar: body.avatar || null,
  });

  return newUser;
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;

  const user = await User.findOne({ email });
  if (!user) throw new NotFoundException("User with this email not found.");

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new InvalidCredentials("Invalid credentials");
  }

  return user;
};
