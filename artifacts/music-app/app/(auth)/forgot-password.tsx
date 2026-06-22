import { useSignIn } from "@clerk/expo";
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

type Step = "email" | "code" | "new-password" | "done";

export default function ForgotPasswordScreen() {
  const signInResult = useSignIn();
  const signIn = (signInResult as any)?.signIn ?? (signInResult as any)?.resource ?? null;
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!signIn) return;
    setLoading(true);
    try {
      await (signIn as any).create({ identifier: email });
      const supportedFactors = (signIn as any).supportedFirstFactors ?? [];
      const emailFactor = supportedFactors.find(
        (f: any) => f.strategy === "reset_password_email_code"
      );
      await (signIn as any).prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: emailFactor?.emailAddressId ?? "",
      });
      setStep("code");
    } catch (e: any) {
      console.error("Send code error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!signIn) return;
    setLoading(true);
    try {
      const result = await (signIn as any).attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });
      if (result.status === "needs_new_password") {
        setStep("new-password");
      }
    } catch (e: any) {
      console.error("Verify code error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!signIn) return;
    setLoading(true);
    try {
      await (signIn as any).resetPassword({ password: newPassword });
      setStep("done");
    } catch (e: any) {
      console.error("Reset password error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Password updated!</Text>
          <Text style={styles.subtitle}>You can now sign in with your new password.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.replace("/(auth)/sign-in" as any)}>
            <Text style={styles.primaryBtnText}>Sign In</Text>
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/beatstream-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Beatstream</Text>
          </View>

          <View style={styles.card}>
            {step === "email" && (
              <>
                <Text style={styles.title}>Forgot password?</Text>
                <Text style={styles.subtitle}>Enter your email and we'll send a reset code</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  autoCapitalize="none"
                  value={email}
                  placeholder="you@example.com"
                  placeholderTextColor="#666"
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />

                <Pressable
                  style={[styles.primaryBtn, (!email || loading) && styles.disabled]}
                  onPress={handleSendCode}
                  disabled={!email || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                  )}
                </Pressable>
              </>
            )}

            {step === "code" && (
              <>
                <Text style={styles.title}>Enter code</Text>
                <Text style={styles.subtitle}>We sent a code to {email}</Text>

                <Text style={styles.label}>Reset code</Text>
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

                <Pressable
                  style={[styles.primaryBtn, (!code || loading) && styles.disabled]}
                  onPress={handleVerifyCode}
                  disabled={!code || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" /> 
                  ) : (
                    <Text style={styles.primaryBtnText}>Verify Code</Text>
                  )}
                </Pressable>

                <Pressable onPress={handleSendCode} style={{ marginTop: 12 }}>
                  <Text style={styles.linkText}>Resend code</Text>
                </Pressable>
              </>
            )}

            {step === "new-password" && (
              <>
                <Text style={styles.title}>New password</Text>
                <Text style={styles.subtitle}>Choose a strong new password</Text>

                <Text style={styles.label}>New password</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    value={newPassword}
                    placeholder="Min. 8 characters"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword}
                    onChangeText={setNewPassword}
                  />
                  <Pressable
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                </View>

                <Pressable
                  style={[styles.primaryBtn, (!newPassword || loading) && styles.disabled]}
                  onPress={handleResetPassword}
                  disabled={!newPassword || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Update Password</Text>
                  )}
                </Pressable>
              </>
            )}

            <View style={styles.footer}>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text style={styles.linkText}>← Back to Sign In</Text>
                </Pressable>
              </Link>
            </View>
          </View>
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
    borderRadius: 16,
  },
  appName: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
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
    alignItems: "center",
    marginTop: 20,
  },
  linkText: {
    color: "#7C3AED",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
});
