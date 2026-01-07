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
  about?: string;
  wallpaper?: string | null;
  isAi?: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type TUpdateProfile = {
  name?: string;
  avatar?: string;
  about?: string;
  wallpaper?: string | null;
};
