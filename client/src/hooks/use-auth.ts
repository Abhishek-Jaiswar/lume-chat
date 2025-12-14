import { API } from "@/lib/axios-client";
import type { TLogin, TRegister, TUser } from "@/types/auth.types";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSocket } from "./use-socket";
import { AxiosError } from "axios";
interface IAuth {
  user: TUser | null;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isAuthStatusLoading: boolean;

  register: (data: TRegister) => void;
  login: (data: TLogin) => void;
  logout: () => void;
  isAuthStatus: () => void;
}

interface ApiErrorResponse {
  message: string;
}

export const useAuth = create<IAuth>()(
  persist(
    (set) => ({
      user: null,
      isSigningUp: false,
      isLoggingIn: false,
      isAuthStatusLoading: false,

      register: async (formData: TRegister) => {
        set({ isSigningUp: true });

        try {
          const response = await API.post("/auth/register", formData);
          set({ user: response.data.user });
          useSocket.getState().connectSocket();
        } catch (error) {
          if (error instanceof AxiosError) {
            toast.error(error.response?.data?.message ?? "Registration failed");
          }
        } finally {
          set({ isSigningUp: false });
        }
      },
      login: () => {},
      logout: () => {},
      isAuthStatus: () => {},
    }),
    {
      name: "whop:root",
    }
  )
);
