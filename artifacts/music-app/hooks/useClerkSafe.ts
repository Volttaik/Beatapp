const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
export const hasClerk = publishableKey.startsWith("pk_");

export function useUserSafe() {
  if (!hasClerk) return { user: null, isLoaded: true };
  const { useUser } = require("@clerk/expo");
  return useUser();
}

export function useAuthSafe() {
  if (!hasClerk) {
    return {
      isSignedIn: true,
      isLoaded: true,
      signOut: async () => {},
    };
  }
  const { useAuth } = require("@clerk/expo");
  return useAuth();
}
