import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import { useLocalAuth } from "@/contexts/LocalAuthContext";

const earthBg = require("@/assets/images/earth-bg.jpg");
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasClerk = publishableKey.startsWith("pk_");

function GlassInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  right,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  autoComplete?: any;
  right?: React.ReactNode;
}) {
  return (
    <View style={inp.wrapper}>
      <TextInput
        style={inp.text}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.22)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
        autoCorrect={false}
        autoComplete={autoComplete}
      />
      {right && <View style={inp.right}>{right}</View>}
    </View>
  );
}

const inp = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  text: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  right: { marginLeft: 8 },
});

function SignUpShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={st.screen}>
      <ImageBackground source={earthBg} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={st.overlay} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          <View style={st.cardConstrained}>
            <View style={st.logoWrap}>
              <Text style={st.appName}>BeatStream</Text>
              <Text style={st.tagline}>Your music, everywhere</Text>
            </View>
            {children}
          </View>
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SignUpLocal() {
  const { signUp } = useLocalAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!name || !email || !password) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signUp(name, email, password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignUpShell>
      <GlassCard style={st.card} intensity={75} shine>
        <Text style={st.title}>Create account</Text>
        <Text style={st.subtitle}>Join BeatStream for free</Text>

        <Text style={st.label}>Name</Text>
        <GlassInput
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
        />

        <Text style={st.label}>Email</Text>
        <GlassInput
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
        />

        <Text style={st.label}>Password</Text>
        <GlassInput
          placeholder="Min. 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          right={
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Text style={st.link}>{showPassword ? "Hide" : "Show"}</Text>
            </Pressable>
          }
        />

        {error ? <Text style={st.error}>{error}</Text> : null}

        <Pressable
          style={[st.btn, (!name || !email || !password || loading) && { opacity: 0.45 }]}
          onPress={handleSignUp}
          disabled={!name || !email || !password || loading}
        >
          <LinearGradient
            colors={["rgba(124,58,237,0.55)", "rgba(109,40,217,0.40)"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={st.btnBorder} />
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={st.btnText}>Create Account</Text>}
        </Pressable>

        <View style={st.footer}>
          <Text style={st.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable><Text style={st.link}>Sign in</Text></Pressable>
          </Link>
        </View>
      </GlassCard>
    </SignUpShell>
  );
}

function SignUpWithClerk() {
  const { useAuth, useSignUp } = require("@clerk/expo");
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const handleSignUp = async () => {
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return;
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }: { session: any; decorateUrl: any }) => {
          if (session?.currentTask) return;
          router.replace("/(tabs)" as any);
        },
      });
    }
  };

  if (signUp.status === "complete" || isSignedIn) return null;

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View style={st.screen}>
        <ImageBackground source={earthBg} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={st.overlay} />
        <View style={st.centered}>
          <GlassCard style={[st.card, st.cardConstrained]} intensity={75} shine>
            <Text style={st.title}>Check your email</Text>
            <Text style={st.subtitle}>We sent a 6-digit code to {email}</Text>
            <GlassInput placeholder="000000" value={code} onChangeText={setCode} keyboardType="numeric" />
            {errors.fields.code && <Text style={st.error}>{errors.fields.code.message}</Text>}
            <Pressable
              style={[st.btn, (!code || fetchStatus === "fetching") && { opacity: 0.45 }]}
              onPress={handleVerify}
              disabled={!code || fetchStatus === "fetching"}
            >
              <LinearGradient colors={["rgba(124,58,237,0.55)", "rgba(109,40,217,0.40)"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              <View style={st.btnBorder} />
              {fetchStatus === "fetching" ? <ActivityIndicator color="#fff" /> : <Text style={st.btnText}>Verify Email</Text>}
            </Pressable>
            <Pressable onPress={() => signUp.verifications.sendEmailCode()} style={st.linkRow}>
              <Text style={st.link}>Resend code</Text>
            </Pressable>
          </GlassCard>
        </View>
      </View>
    );
  }

  return (
    <SignUpShell>
      <GlassCard style={st.card} intensity={75} shine>
        <Text style={st.title}>Create account</Text>
        <Text style={st.subtitle}>Join BeatStream for free</Text>
        <Text style={st.label}>Email</Text>
        <GlassInput placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
        {errors.fields.emailAddress && <Text style={st.error}>{errors.fields.emailAddress.message}</Text>}
        <Text style={st.label}>Password</Text>
        <GlassInput
          placeholder="Min. 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          right={
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Text style={st.link}>{showPassword ? "Hide" : "Show"}</Text>
            </Pressable>
          }
        />
        {errors.fields.password && <Text style={st.error}>{errors.fields.password.message}</Text>}
        <Pressable
          style={[st.btn, (!email || !password || fetchStatus === "fetching") && { opacity: 0.45 }]}
          onPress={handleSignUp}
          disabled={!email || !password || fetchStatus === "fetching"}
        >
          <LinearGradient colors={["rgba(124,58,237,0.55)", "rgba(109,40,217,0.40)"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <View style={st.btnBorder} />
          {fetchStatus === "fetching" ? <ActivityIndicator color="#fff" /> : <Text style={st.btnText}>Create Account</Text>}
        </Pressable>
        <View style={st.footer}>
          <Text style={st.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable><Text style={st.link}>Sign in</Text></Pressable>
          </Link>
        </View>
      </GlassCard>
    </SignUpShell>
  );
}

export default function SignUpScreen() {
  if (hasClerk) return <SignUpWithClerk />;
  return <SignUpLocal />;
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#02040C" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2,4,12,0.75)" },
  centered: { flex: 1, justifyContent: "center", padding: 24, alignItems: "center" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24, paddingBottom: 40, alignItems: "center" },
  cardConstrained: { width: "100%", maxWidth: 420 },
  logoWrap: { alignItems: "center", marginBottom: 28 },
  appName: { color: "#fff", fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tagline: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  card: { borderRadius: 24, padding: 24, overflow: "hidden" },
  title: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 5 },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  label: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 5,
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  btn: {
    borderRadius: 14,
    backgroundColor: "rgba(124,58,237,0.15)",
    paddingVertical: 16,
    alignItems: "center",
    overflow: "hidden",
    marginTop: 4,
  },
  btnBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.20)",
    borderLeftColor: "rgba(255,255,255,0.10)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "Inter_400Regular" },
  link: { color: "#A78BFA", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  error: { color: "#EF4444", fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  linkRow: { alignItems: "center", marginTop: 10 },
});
