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
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        router.replace("/login"); // Expo Router path
      }, 1000);
    });
  }, []);

  return (
    <LinearGradient colors={["#E0F0FF", "#3B82F6"]} style={styles.container}>
      <Animated.Image
        source={require("../assets/images/logo.png")}
        style={[styles.image, { opacity: fadeAnim }]}
      />
      <Text style={styles.appName}>NOTES</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: 150, height: 150, resizeMode: "contain" },
  appName: { fontSize: 24, fontWeight: "bold", color: "#fff" }
});
