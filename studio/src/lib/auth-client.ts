import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { getIsomorphicHeaders } from "./api-client";
import { API_URL } from "@/constants/app";

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    headers: async () => await getIsomorphicHeaders(),
  },
  plugins: [adminClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
