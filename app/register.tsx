// app/register.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";

const Register = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation values
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

  const handleRegister = async () => {
    if (!email || !password) {
      showMessage("Please enter email and password", "error");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      showMessage(`Registered with ${userCredential.user.email}`, "success");
      setTimeout(() => router.push("/login"), 1200);
    } catch (error: any) {
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => router.push("/login");

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      {/* Top Alert */}
      {message && (
        <Animated.View
          style={[
            styles.messageContainer,
            {
              backgroundColor:
                message.type === "success"
                  ? "rgba(72, 187, 120,0.25)"
                  : "rgba(220,38,38,0.25)",
              borderColor:
                message.type === "success"
                  ? "rgba(72, 187, 120,0.6)"
                  : "rgba(220,38,38,0.6)",
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.messageText}>{message.text}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <Animated.View style={{ opacity: fadeLogo, alignItems: "center", marginBottom: 10 }}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} />
          </Animated.View>

          {/* App Name */}
          <Animated.Text style={[styles.appName, { opacity: fadeAppName }]}>NOTEZY</Animated.Text>

          {/* Title */}
          <Animated.Text style={[styles.title, { opacity: fadeTitle }]}>Create Your Account</Animated.Text>

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
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Link */}
          <Animated.View style={{ opacity: fadeLink }}>
            <TouchableOpacity onPress={goToLogin} style={styles.registerContainer}>
              <Text style={styles.mainText}>
                Already have an account?
                <Text style={styles.registerText}> Login</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 40 },
  logo: { width: 100, height: 100, resizeMode: "contain", opacity: 0.85 },
  appName: { fontSize: 22, fontWeight: "bold", color: "#ffffffcc", textAlign: "center", marginBottom: 20, top: -36 },
  title: { fontSize: 26, fontWeight: "600", marginBottom: 25, textAlign: "center", color: "#fff" },
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
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  registerText: { color: "#75c779ff", fontSize: 16, fontWeight: "bold" },
  mainText: { color: "#fff", fontSize: 16 },
  registerContainer: { flexDirection: "row", justifyContent: "center", marginTop: 15 },
  messageContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    zIndex: 999,
  },
  messageText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
