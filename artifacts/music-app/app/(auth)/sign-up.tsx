import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
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

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const handleSignUp = async () => {
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }
    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
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
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to {email}
          </Text>

          <Text style={styles.label}>Verification code</Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="000000"
            placeholderTextColor="#666"
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
          />
          {errors.fields.code && (
            <Text style={styles.errorText}>{errors.fields.code.message}</Text>
          )}

          <Pressable
            style={[styles.primaryBtn, fetchStatus === "fetching" && styles.disabled]}
            onPress={handleVerify}
            disabled={fetchStatus === "fetching"}
          >
            {fetchStatus === "fetching" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Verify Email</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => signUp.verifications.sendEmailCode()}
            style={{ marginTop: 12 }}
          >
            <Text style={styles.linkText}>Resend code</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/beatstream-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Beatstream</Text>
            <Text style={styles.tagline}>Your music, everywhere</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join Beatstream for free</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={email}
              placeholder="you@example.com"
              placeholderTextColor="#666"
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
            />
            {errors.fields.emailAddress && (
              <Text style={styles.errorText}>{errors.fields.emailAddress.message}</Text>
            )}

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={password}
                placeholder="Min. 8 characters"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                autoComplete="new-password"
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
            {errors.fields.password && (
              <Text style={styles.errorText}>{errors.fields.password.message}</Text>
            )}

            <Pressable
              style={[
                styles.primaryBtn,
                (!email || !password || fetchStatus === "fetching") && styles.disabled,
              ]}
              onPress={handleSignUp}
              disabled={!email || !password || fetchStatus === "fetching"}
            >
              {fetchStatus === "fetching" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Create Account</Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text style={styles.footerLink}>Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Required for Clerk bot protection */}
          <View nativeID="clerk-captcha" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  container: {
    flex: 1,
    backgroundColor: "#08080F",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  appName: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  tagline: {
    color: "#888",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#12121F",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E1E30",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
  },
  label: {
    color: "#aaa",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#1E1E30",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderColor: "#2A2A40",
    marginBottom: 4,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#1E1E30",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A40",
  },
  eyeText: {
    color: "#7C3AED",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  primaryBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  disabled: { opacity: 0.5 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#888",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  footerLink: {
    color: "#7C3AED",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginBottom: 4,
  },
  linkText: {
    color: "#7C3AED",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
});
