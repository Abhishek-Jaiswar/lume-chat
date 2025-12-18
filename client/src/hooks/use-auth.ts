import { API } from "@/lib/axios-client";
import type { TLogin, TRegister, TUser } from "@/types/auth.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSocket } from "./use-socket";
import { handleApiError } from "@/lib/axios-api-error";

interface AuthResult {
  success: boolean;
  error?: string;
}

interface IAuth {
  user: TUser | null;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isAuthStatusLoading: boolean;

  register: (data: TRegister) => Promise<AuthResult>;
  login: (data: TLogin) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isAuthStatus: () => Promise<void>;
}

export const useAuth = create<IAuth>()(
  persist(
    (set) => ({
      user: null,
      isSigningUp: false,
      isLoggingIn: false,
      isAuthStatusLoading: false,

      register: async (formData) => {
        set({ isSigningUp: true });

        try {
          const res = await API.post("/auth/register", formData);
          set({ user: res.data.user });
          useSocket.getState().connectSocket();

          return { success: true };
        } catch (error) {
          const err = handleApiError(error);
          return { success: false, error: err.message };
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async (formData) => {
        set({ isLoggingIn: true });

        try {
          const res = await API.post("/auth/login", formData);
          set({ user: res.data.user });
          useSocket.getState().connectSocket();

          return { success: true };
        } catch (error) {
          const err = handleApiError(error);
          return { success: false, error: err.message };
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        await API.post("/auth/logout");
        set({ user: null });
        useSocket.getState().disconnectSocket();
      },

      isAuthStatus: async () => {
        set({ isAuthStatusLoading: true });

        try {
          const res = await API.get("/auth/status");
          set({ user: res.data.user });
          useSocket.getState().connectSocket();
        } finally {
          set({ isAuthStatusLoading: false });
        }
      },
    }),
    { name: "lume:root" }
  )
);
