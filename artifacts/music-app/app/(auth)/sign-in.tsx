import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
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

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const handleSignIn = async () => {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          router.replace("/(tabs)" as any);
        },
      });
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: () => { router.replace("/(tabs)" as any); },
      });
    }
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <View style={st.screen}>
        <LinearGradient colors={["#0A0818", "#1E0A5A", "#050508"]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
        <View style={st.glow} />
        <GlassCard style={st.card} intensity={50}>
          <Text style={st.title}>Verify your account</Text>
          <Text style={st.subtitle}>We sent a code to your email</Text>
          <TextInput style={st.input} value={code} placeholder="000000" placeholderTextColor="rgba(255,255,255,0.3)" onChangeText={setCode} keyboardType="numeric" maxLength={6} textAlign="center" />
          {errors.fields.code && <Text style={st.error}>{errors.fields.code.message}</Text>}
          <Pressable style={[st.btn, fetchStatus === "fetching" && st.btnDim]} onPress={handleVerify} disabled={fetchStatus === "fetching"}>
            {fetchStatus === "fetching" ? <ActivityIndicator color="#fff" /> : <Text style={st.btnText}>Verify</Text>}
          </Pressable>
          <Pressable onPress={() => signIn.mfa.sendEmailCode()} style={st.linkRow}>
            <Text style={st.link}>Resend code</Text>
          </Pressable>
          <Pressable onPress={() => signIn.reset()} style={st.linkRow}>
            <Text style={st.link}>Start over</Text>
          </Pressable>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={st.screen}>
      <LinearGradient colors={["#0A0818", "#1E0A5A", "#050508"]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <View style={st.glow} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={st.logoWrap}>
            <Image source={require("@/assets/images/icon.png")} style={st.logo} resizeMode="contain" />
            <Text style={st.appName}>Beat Stream</Text>
            <Text style={st.tagline}>Your music, everywhere</Text>
          </View>

          <GlassCard style={st.card} intensity={50}>
            <Text style={st.title}>Welcome back</Text>
            <Text style={st.subtitle}>Sign in to continue</Text>

            <Text style={st.label}>Email</Text>
            <TextInput style={st.input} autoCapitalize="none" value={email} placeholder="you@example.com" placeholderTextColor="rgba(255,255,255,0.3)" onChangeText={setEmail} keyboardType="email-address" />
            {errors.fields.identifier && <Text style={st.error}>{errors.fields.identifier.message}</Text>}

            <Text style={st.label}>Password</Text>
            <View style={st.passwordRow}>
              <TextInput style={[st.input, { flex: 1, marginBottom: 0 }]} value={password} placeholder="••••••••" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry={!showPassword} onChangeText={setPassword} />
              <Pressable style={st.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Text style={st.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
            {errors.fields.password && <Text style={st.error}>{errors.fields.password.message}</Text>}

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={st.forgotRow}><Text style={st.link}>Forgot password?</Text></Pressable>
            </Link>

            <Pressable style={[st.btn, (!email || !password || fetchStatus === "fetching") && st.btnDim]} onPress={handleSignIn} disabled={!email || !password || fetchStatus === "fetching"}>
              {fetchStatus === "fetching" ? <ActivityIndicator color="#fff" /> : <Text style={st.btnText}>Sign In</Text>}
            </Pressable>

            <View style={st.footer}>
              <Text style={st.footerText}>No account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable><Text style={st.link}>Create one</Text></Pressable>
              </Link>
            </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#080810" },
  glow: { position: "absolute", top: -100, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: "#5B21B6", opacity: 0.25 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  logo: { width: 80, height: 80, marginBottom: 10 },
  appName: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tagline: { color: "rgba(255,255,255,0.45)", fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  card: { borderRadius: 20, padding: 24 },
  title: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  label: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 4,
  },
  passwordRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  eyeBtn: { paddingHorizontal: 14, justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  eyeText: { color: "#A78BFA", fontSize: 13, fontFamily: "Inter_500Medium" },
  forgotRow: { alignSelf: "flex-end", marginTop: 6, marginBottom: 16 },
  btn: { backgroundColor: "#7C3AED", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 4 },
  btnDim: { opacity: 0.45 },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "rgba(255,255,255,0.45)", fontSize: 14, fontFamily: "Inter_400Regular" },
  link: { color: "#A78BFA", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  error: { color: "#EF4444", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  linkRow: { alignItems: "center", marginTop: 10 },
});
