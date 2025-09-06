// app/login.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation values for UI
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const fadeAppName = useRef(new Animated.Value(0)).current;
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeInputs = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;
  const fadeLink = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeLogo, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAppName, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeTitle, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeInputs, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(fadeButton, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeLink, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
          setMessage(null)
        );
      }, 2000);
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage("Login Failed", "error");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("Login Successful", "success");
      setTimeout(() => router.push("/home"), 1000);
    } catch {
      showMessage("Login Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => router.push("/register");

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo + App Name */}
          <Animated.View style={{ opacity: fadeLogo, alignItems: "center", marginBottom: 10 }}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} />
          </Animated.View>

          <Animated.Text style={[styles.appName, { opacity: fadeAppName }]}>
            NOTEZY
          </Animated.Text>

          <Animated.Text style={[styles.title, { opacity: fadeTitle }]}>
            Welcome Back
          </Animated.Text>

          {/* Inputs */}
          <Animated.View style={{ opacity: fadeInputs }}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Animated.View>

          {/* Button */}
          <Animated.View style={{ transform: [{ scale: fadeButton }] }}>
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Link */}
          <Animated.View style={{ opacity: fadeLink }}>
            <TouchableOpacity onPress={handleRegister} style={styles.registerContainer}>
              <Text style={styles.mainText}>
                Don't have an account?
                <Text style={styles.registerText}> Register</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Messages */}
          {message && (
            <Animated.View
              style={[
                styles.messageContainer,
                {
                  backgroundColor:
                    message.type === "success"
                      ? "rgba(72, 187, 120,0.85)"
                      : "rgba(220,38,38,0.85)",
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    opacity: 0.85,
    marginBottom: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffffcc",
    textAlign: "center",
    marginBottom: 15,
    top: -45,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 25,
    textAlign: "center",
    color: "#fff",
    textShadowColor: "rgba(192, 192, 192, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mainText: { color: "#fff", fontSize: 16 },
  registerContainer: { flexDirection: "row", justifyContent: "center", marginTop: 15 },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  registerText: { color: "#75c779ff", fontSize: 16, fontWeight: "bold" },
  messageContainer: {
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  messageText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
