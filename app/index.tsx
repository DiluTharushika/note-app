// app/splash.tsx
import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        router.replace("/login"); // Navigate to login
      }, 1000);
    });
  }, []);

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Animated.Image
          source={require("../assets/images/logo.png")}
          style={[styles.image, { opacity: fadeAnim }]}
        />
        <Text style={styles.appName}>NOTEZY</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 180,
    resizeMode: "contain",
    top: -40,
  },
  appName: {
    position: "absolute",
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
});
