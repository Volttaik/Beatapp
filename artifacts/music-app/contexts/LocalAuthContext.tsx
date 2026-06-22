import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface LocalUser {
  name: string;
  email: string;
}

interface LocalAuthState {
  user: LocalUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const LocalAuthContext = createContext<LocalAuthState | null>(null);

const CURRENT_USER_KEY = "beatstream_local_user";
const ALL_USERS_KEY = "beatstream_local_users";

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CURRENT_USER_KEY)
      .then((val) => {
        if (val) setUser(JSON.parse(val));
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const usersRaw = await AsyncStorage.getItem(ALL_USERS_KEY);
    const users: Record<string, { name: string; password: string }> = usersRaw
      ? JSON.parse(usersRaw)
      : {};
    if (users[email.toLowerCase()]) {
      throw new Error("An account with this email already exists.");
    }
    users[email.toLowerCase()] = { name, password };
    const newUser: LocalUser = { name, email: email.toLowerCase() };
    await AsyncStorage.multiSet([
      [ALL_USERS_KEY, JSON.stringify(users)],
      [CURRENT_USER_KEY, JSON.stringify(newUser)],
    ]);
    setUser(newUser);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const usersRaw = await AsyncStorage.getItem(ALL_USERS_KEY);
    const users: Record<string, { name: string; password: string }> = usersRaw
      ? JSON.parse(usersRaw)
      : {};
    const record = users[email.toLowerCase()];
    if (!record) throw new Error("No account found for this email.");
    if (record.password !== password) throw new Error("Incorrect password.");
    const localUser: LocalUser = { name: record.name, email: email.toLowerCase() };
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(localUser));
    setUser(localUser);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }, []);

  return (
    <LocalAuthContext.Provider
      value={{ user, isLoaded, isSignedIn: !!user, signUp, signIn, signOut }}
    >
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth() {
  const ctx = useContext(LocalAuthContext);
  if (!ctx) throw new Error("useLocalAuth must be used within LocalAuthProvider");
  return ctx;
}
