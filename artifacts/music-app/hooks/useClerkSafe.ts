import { useLocalAuth } from "@/contexts/LocalAuthContext";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
export const hasClerk = publishableKey.startsWith("pk_");

export function useUserSafe() {
  const localAuth = useLocalAuth();

  if (hasClerk) {
    const { useUser } = require("@clerk/expo");
    return useUser();
  }

  return {
    user: localAuth.user
      ? {
          firstName: localAuth.user.name,
          fullName: localAuth.user.name,
          emailAddresses: [{ emailAddress: localAuth.user.email }],
        }
      : null,
    isLoaded: localAuth.isLoaded,
  };
}

export function useAuthSafe() {
  const localAuth = useLocalAuth();

  if (hasClerk) {
    const { useAuth } = require("@clerk/expo");
    return useAuth();
  }

  return {
    isSignedIn: localAuth.isSignedIn,
    isLoaded: localAuth.isLoaded,
    signOut: localAuth.signOut,
  };
}
