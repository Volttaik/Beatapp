import { Link, useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

import { useLocalAuth } from "@/contexts/LocalAuthContext";

const logoImg = require("@/assets/images/beatstream-logo.png");
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasClerk = publishableKey.startsWith("pk_");

function AnimatedBlob({
  color, size, x, y, duration,
}: { color: string; size: number; x: number; y: number; duration: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
      ),
      -1, false
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-20, 20]) },
      { translateY: interpolate(progress.value, [0, 1], [-18, 18]) },
      { scale: interpolate(progress.value, [0, 1], [0.88, 1.12]) },
    ],
  }));
  return (
    <Animated.View style={[{
      position: "absolute", left: x - size / 2, top: y - size / 2,
      width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: 0.3,
    }, style]} />
  );
}

function SpotifyInput({ placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, right }: {
  placeholder: string; value: string; onChangeText: (t: string) => void;
  secureTextEntry?: boolean; keyboardType?: any; autoCapitalize?: any; right?: React.ReactNode;
}) {
  const focused = useSharedValue(0);
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(196,181,253,${interpolate(focused.value, [0, 1], [0, 0.55])})`,
    borderWidth: 1,
  }));
  return (
    <Animated.View style={[inp.wrapper, borderStyle]}>
      <TextInput
        style={inp.text}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.28)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
        autoCorrect={false}
        onFocus={() => { focused.value = withTiming(1, { duration: 200 }); }}
        onBlur={() => { focused.value = withTiming(0, { duration: 200 }); }}
      />
      {right && <View style={inp.right}>{right}</View>}
    </Animated.View>
  );
}

const inp = StyleSheet.create({
  wrapper: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "web" ? 16 : 14,
  },
  text: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
    outlineStyle: "none",
  } as any,
  right: { marginLeft: 8 },
});

function AuthBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]} />
      <AnimatedBlob color="#3B0764" size={280} x={40} y={80} duration={7000} />
      <AnimatedBlob color="#1E1B4B" size={220} x={320} y={200} duration={9000} />
      <AnimatedBlob color="#0C4A6E" size={200} x={160} y={520} duration={11000} />
      <LinearGradient
        colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.65)", "#000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />
    </View>
  );
}

function SignInShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={st.screen}>
      <AuthBackground />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          <View style={st.constrained}>
            <Animated.View entering={FadeInDown.springify().damping(18).stiffness(90)} style={st.logoWrap}>
              <Animated.View entering={FadeIn.delay(100).duration(500)}>
                <Image source={logoImg} style={st.logoImg} contentFit="contain" />
              </Animated.View>
              <Animated.Text entering={FadeInDown.delay(160).duration(400)} style={st.appName}>BeatStream</Animated.Text>
              <Animated.Text entering={FadeInDown.delay(220).duration(400)} style={st.tagline}>Millions of tracks, for free</Animated.Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(280).springify().damping(18)}>
              {children}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SignInLocal() {
  const { signIn } = useLocalAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignInShell>
      <Text style={st.formTitle}>Log in</Text>
      <Text style={st.label}>Email</Text>
      <SpotifyInput placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Text style={st.label}>Password</Text>
      <SpotifyInput
        placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
        right={
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="rgba(255,255,255,0.45)" />
          </Pressable>
        }
      />
      {error ? <Text style={st.error}>{error}</Text> : null}
      <Animated.View style={btnStyle}>
        <Pressable
          style={[st.btn, (!email || !password || loading) && { opacity: 0.4 }]}
          onPress={handleSignIn}
          disabled={!email || !password || loading}
          onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 10, stiffness: 400 }); }}
          onPressOut={() => { btnScale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={st.btnText}>Log In</Text>}
        </Pressable>
      </Animated.View>
      <View style={st.divider}>
        <View style={st.dividerLine} />
        <Text style={st.dividerText}>or</Text>
        <View style={st.dividerLine} />
      </View>
      <View style={st.footer}>
        <Text style={st.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable><Text style={st.link}>Sign up for free</Text></Pressable>
        </Link>
      </View>
    </SignInShell>
  );
}

function SignInWithClerk() {
  const { useSignIn } = require("@clerk/expo");
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleSignIn = async () => {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;
    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: ({ session }: any) => { if (!session?.currentTask) router.replace("/(tabs)" as any); } });
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: () => { router.replace("/(tabs)" as any); } });
    }
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <SignInShell>
        <Text style={st.formTitle}>Verify your account</Text>
        <Text style={st.subtitle}>We sent a code to your email</Text>
        <SpotifyInput placeholder="000000" value={code} onChangeText={setCode} keyboardType="numeric" />
        {errors.fields.code && <Text style={st.error}>{errors.fields.code.message}</Text>}
        <Pressable style={[st.btn, fetchStatus === "fetching" && { opacity: 0.4 }]} onPress={handleVerify} disabled={fetchStatus === "fetching"}>
          {fetchStatus === "fetching" ? <ActivityIndicator color="#000" /> : <Text style={st.btnText}>Verify Code</Text>}
        </Pressable>
        <Pressable onPress={() => signIn.mfa.sendEmailCode()} style={st.linkRow}>
          <Text style={st.link}>Resend code</Text>
        </Pressable>
      </SignInShell>
    );
  }

  return (
    <SignInShell>
      <Text style={st.formTitle}>Log in</Text>
      <Text style={st.label}>Email</Text>
      <SpotifyInput placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" />
      {errors.fields.identifier ? <Text style={st.error}>{errors.fields.identifier.message}</Text> : null}
      <Text style={st.label}>Password</Text>
      <SpotifyInput
        placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
        right={
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="rgba(255,255,255,0.45)" />
          </Pressable>
        }
      />
      {errors.fields.password ? <Text style={st.error}>{errors.fields.password.message}</Text> : null}
      <Link href="/(auth)/forgot-password" asChild>
        <Pressable style={st.forgotRow}><Text style={st.link}>Forgot password?</Text></Pressable>
      </Link>
      <Animated.View style={btnStyle}>
        <Pressable
          style={[st.btn, (!email || !password || fetchStatus === "fetching") && { opacity: 0.4 }]}
          onPress={handleSignIn}
          disabled={!email || !password || fetchStatus === "fetching"}
          onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 10, stiffness: 400 }); }}
          onPressOut={() => { btnScale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
        >
          {fetchStatus === "fetching" ? <ActivityIndicator color="#000" /> : <Text style={st.btnText}>Log In</Text>}
        </Pressable>
      </Animated.View>
      <View style={st.divider}><View style={st.dividerLine} /><Text style={st.dividerText}>or</Text><View style={st.dividerLine} /></View>
      <View style={st.footer}>
        <Text style={st.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable><Text style={st.link}>Sign up for free</Text></Pressable>
        </Link>
      </View>
    </SignInShell>
  );
}

export default function SignInScreen() {
  if (hasClerk) return <SignInWithClerk />;
  return <SignInLocal />;
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 32, paddingBottom: 48 },
  constrained: { width: "100%", maxWidth: 400, alignSelf: "center" },
  logoWrap: { alignItems: "center", marginBottom: 40 },
  logoImg: { width: 80, height: 80, marginBottom: 16 },
  appName: { color: "#FFFFFF", fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tagline: { color: "rgba(255,255,255,0.45)", fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 6 },
  formTitle: { color: "#FFFFFF", fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 24, textAlign: "center" },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20, textAlign: "center" },
  label: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  forgotRow: { alignSelf: "flex-end", marginBottom: 20, marginTop: 4 },
  btn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 500,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#000000", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 24, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  dividerText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Inter_400Regular" },
  footer: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  footerText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular" },
  link: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_700Bold", textDecorationLine: "underline" },
  error: { color: "#F87171", fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8, marginTop: 2 },
  linkRow: { alignItems: "center", marginTop: 12 },
});
