import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import GlassIcon from "@/components/GlassIcon";

const earthBg = require("@/assets/images/earth-bg.jpg");

function GlassInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  right,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  right?: React.ReactNode;
}) {
  return (
    <View style={inp.wrapper}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={inp.inner}>
        <TextInput
          style={inp.text}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "none"}
          autoCorrect={false}
        />
        {right}
      </View>
    </View>
  );
}

const inp = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.20)",
    borderLeftColor: "rgba(255,255,255,0.10)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.04)",
    marginBottom: 12,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(8,8,18,0.55)",
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
});

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
        navigate: ({ session }: { session: any; decorateUrl: any }) => {
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
        <ImageBackground source={earthBg} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={st.overlay} />
        <View style={st.centered}>
          <GlassCard style={st.card} intensity={75} shine>
            <Text style={st.title}>Verify your account</Text>
            <Text style={st.subtitle}>We sent a code to your email</Text>
            <GlassInput placeholder="000000" value={code} onChangeText={setCode} keyboardType="numeric" />
            {errors.fields.code && <Text style={st.error}>{errors.fields.code.message}</Text>}
            <Pressable
              style={[st.btn, fetchStatus === "fetching" && { opacity: 0.45 }]}
              onPress={handleVerify}
              disabled={fetchStatus === "fetching"}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.04)"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              {fetchStatus === "fetching"
                ? <ActivityIndicator color="#fff" />
                : <Text style={st.btnText}>Verify Code</Text>}
            </Pressable>
            <Pressable onPress={() => signIn.mfa.sendEmailCode()} style={st.linkRow}>
              <Text style={st.link}>Resend code</Text>
            </Pressable>
          </GlassCard>
        </View>
      </View>
    );
  }

  return (
    <View style={st.screen}>
      <ImageBackground source={earthBg} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={st.overlay} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={st.logoWrap}>
            <GlassCard style={st.logoBg} intensity={60} shine>
              <Image
                source={require("@/assets/images/beatstream-logo.png")}
                style={st.logo}
                resizeMode="contain"
              />
            </GlassCard>
            <Text style={st.appName}>BeatStream</Text>
            <Text style={st.tagline}>Your music, everywhere</Text>
          </View>

          {/* Glass card */}
          <GlassCard style={st.card} intensity={75} shine>
            <Text style={st.title}>Welcome back</Text>
            <Text style={st.subtitle}>Sign in to your account</Text>

            <Text style={st.label}>Email</Text>
            <GlassInput
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            {errors.fields.identifier ? (
              <Text style={st.error}>{errors.fields.identifier.message}</Text>
            ) : null}

            <Text style={st.label}>Password</Text>
            <GlassInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              right={
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Text style={st.link}>{showPassword ? "Hide" : "Show"}</Text>
                </Pressable>
              }
            />
            {errors.fields.password ? (
              <Text style={st.error}>{errors.fields.password.message}</Text>
            ) : null}

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={st.forgotRow}>
                <Text style={st.link}>Forgot password?</Text>
              </Pressable>
            </Link>

            <Pressable
              style={[st.btn, (!email || !password || fetchStatus === "fetching") && { opacity: 0.45 }]}
              onPress={handleSignIn}
              disabled={!email || !password || fetchStatus === "fetching"}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              {fetchStatus === "fetching"
                ? <ActivityIndicator color="#fff" />
                : <Text style={st.btnText}>Sign In</Text>}
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
  screen: { flex: 1, backgroundColor: "#02040C" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2,4,12,0.75)" },
  centered: { flex: 1, justifyContent: "center", padding: 24 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24, paddingBottom: 40 },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  logo: { width: 58, height: 58 },
  appName: { color: "#fff", fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tagline: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  card: { borderRadius: 24, padding: 26, overflow: "hidden" },
  title: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 5 },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 22 },
  label: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  forgotRow: { alignSelf: "flex-end", marginBottom: 18 },
  btn: {
    borderRadius: 14,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.22)",
    borderLeftColor: "rgba(255,255,255,0.12)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.04)",
    backgroundColor: "rgba(124,58,237,0.30)",
    paddingVertical: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "Inter_400Regular" },
  link: { color: "#A78BFA", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  error: { color: "#EF4444", fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  linkRow: { alignItems: "center", marginTop: 10 },
});
