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

function AnimatedBlob({ color, size, x, y, duration }: { color: string; size: number; x: number; y: number; duration: number }) {
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

function SpotifyInput({ placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, autoComplete, right }: {
  placeholder: string; value: string; onChangeText: (t: string) => void;
  secureTextEntry?: boolean; keyboardType?: any; autoCapitalize?: any; autoComplete?: any; right?: React.ReactNode;
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
        autoComplete={autoComplete}
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
      <AnimatedBlob color="#3B0764" size={260} x={320} y={100} duration={8000} />
      <AnimatedBlob color="#1E1B4B" size={200} x={50} y={250} duration={10000} />
      <AnimatedBlob color="#0C4A6E" size={240} x={200} y={580} duration={12000} />
      <LinearGradient
        colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.65)", "#000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />
    </View>
  );
}

function SignUpShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={st.screen}>
      <AuthBackground />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          <View style={st.constrained}>
            <Animated.View entering={FadeInDown.springify().damping(18).stiffness(90)} style={st.logoWrap}>
              <Animated.View entering={FadeIn.delay(80).duration(500)}>
                <Image source={logoImg} style={st.logoImg} contentFit="contain" />
              </Animated.View>
              <Animated.Text entering={FadeInDown.delay(140).duration(400)} style={st.appName}>BeatStream</Animated.Text>
              <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={st.tagline}>Free music, everywhere</Animated.Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(260).springify().damping(18)}>
              {children}
            </Animated.View>
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

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleSignUp = async () => {
    if (!name || !email || !password) return;
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      await signUp(name, email, password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignUpShell>
      <Text style={st.formTitle}>Create account</Text>
      <Text style={st.label}>What should we call you?</Text>
      <SpotifyInput placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" autoComplete="name" />
      <Text style={st.label}>Email</Text>
      <SpotifyInput placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
      <Text style={st.label}>Password</Text>
      <SpotifyInput
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        autoComplete="new-password"
        right={
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="rgba(255,255,255,0.45)" />
          </Pressable>
        }
      />
      {error ? <Text style={st.error}>{error}</Text> : null}
      <Animated.View style={btnStyle}>
        <Pressable
          style={[st.btn, (!name || !email || !password || loading) && { opacity: 0.4 }]}
          onPress={handleSignUp}
          disabled={!name || !email || !password || loading}
          onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 10, stiffness: 400 }); }}
          onPressOut={() => { btnScale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={st.btnText}>Sign Up Free</Text>}
        </Pressable>
      </Animated.View>
      <View style={st.divider}>
        <View style={st.dividerLine} />
        <Text style={st.dividerText}>or</Text>
        <View style={st.dividerLine} />
      </View>
      <View style={st.footer}>
        <Text style={st.footerText}>Already have an account? </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable><Text style={st.link}>Log in</Text></Pressable>
        </Link>
      </View>
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

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleSignUp = async () => {
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return;
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({ navigate: ({ session, decorateUrl }: any) => { if (!session?.currentTask) router.replace("/(tabs)" as any); } });
    }
  };

  if (signUp.status === "complete" || isSignedIn) return null;

  if (signUp.status === "missing_requirements" && signUp.unverifiedFields.includes("email_address") && signUp.missingFields.length === 0) {
    return (
      <SignUpShell>
        <Text style={st.formTitle}>Check your email</Text>
        <Text style={st.subtitle}>We sent a 6-digit code to {email}</Text>
        <SpotifyInput placeholder="000000" value={code} onChangeText={setCode} keyboardType="numeric" />
        {errors.fields.code && <Text style={st.error}>{errors.fields.code.message}</Text>}
        <Pressable style={[st.btn, (!code || fetchStatus === "fetching") && { opacity: 0.4 }]} onPress={handleVerify} disabled={!code || fetchStatus === "fetching"}>
          {fetchStatus === "fetching" ? <ActivityIndicator color="#000" /> : <Text style={st.btnText}>Verify Email</Text>}
        </Pressable>
        <Pressable onPress={() => signUp.verifications.sendEmailCode()} style={st.linkRow}>
          <Text style={st.link}>Resend code</Text>
        </Pressable>
      </SignUpShell>
    );
  }

  return (
    <SignUpShell>
      <Text style={st.formTitle}>Create account</Text>
      <Text style={st.label}>Email</Text>
      <SpotifyInput placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
      {errors.fields.emailAddress && <Text style={st.error}>{errors.fields.emailAddress.message}</Text>}
      <Text style={st.label}>Password</Text>
      <SpotifyInput
        placeholder="Create a password" value={password} onChangeText={setPassword}
        secureTextEntry={!showPassword} autoComplete="new-password"
        right={
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="rgba(255,255,255,0.45)" />
          </Pressable>
        }
      />
      {errors.fields.password && <Text style={st.error}>{errors.fields.password.message}</Text>}
      <Animated.View style={btnStyle}>
        <Pressable
          style={[st.btn, (!email || !password || fetchStatus === "fetching") && { opacity: 0.4 }]}
          onPress={handleSignUp}
          disabled={!email || !password || fetchStatus === "fetching"}
          onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 10, stiffness: 400 }); }}
          onPressOut={() => { btnScale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
        >
          {fetchStatus === "fetching" ? <ActivityIndicator color="#000" /> : <Text style={st.btnText}>Sign Up Free</Text>}
        </Pressable>
      </Animated.View>
      <View style={st.divider}><View style={st.dividerLine} /><Text style={st.dividerText}>or</Text><View style={st.dividerLine} /></View>
      <View style={st.footer}>
        <Text style={st.footerText}>Already have an account? </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable><Text style={st.link}>Log in</Text></Pressable>
        </Link>
      </View>
    </SignUpShell>
  );
}

export default function SignUpScreen() {
  if (hasClerk) return <SignUpWithClerk />;
  return <SignUpLocal />;
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
  error: { color: "#F87171", fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  linkRow: { alignItems: "center", marginTop: 12 },
});
