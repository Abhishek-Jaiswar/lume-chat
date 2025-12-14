export type TRegister = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
};

export type TLogin = {
  email: string;
  password: string;
};

export type TUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
