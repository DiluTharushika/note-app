// app/addNote.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddNote() {
  const navigation = useNavigation();
  const [noteText, setNoteText] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      showMessage("Please enter a note.", "error");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        showMessage("User not logged in.", "error");
        return;
      }

      const noteData = {
        text: noteText.trim(),
        uid: user.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "notes"), noteData);
      showMessage("Note added successfully!", "success");
      setNoteText(""); // clear input
      setTimeout(() => navigation.goBack(), 1200);
    } catch (error) {
      console.error("Error adding note:", error);
      showMessage("Failed to add note. Please try again.", "error");
    }
  };

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      {/* Top Alert */}
      {message && (
        <Animated.View
          style={[
            styles.messageContainer,
            {
              backgroundColor:
                message.type === "success"
                  ? "rgba(7, 124, 56, 1)"
                  : "rgba(220, 38, 38, 1)",
              borderColor:
                message.type === "success"
                  ? "rgba(72, 187, 120, 1)"
                  : "rgba(220, 38, 38, 1)",
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.messageText}>{message.text}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>Add New Note</Text>

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Write your note here..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={noteText}
            onChangeText={setNoteText}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={handleAddNote}>
            <Text style={styles.buttonText}>Save Note</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    paddingTop: 25,
  },
  label: { color: "#fff", fontSize: 14, marginBottom: 5, marginLeft: 5 },
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
  multilineInput: { height: 100, textAlignVertical: "top" },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
    textDecorationLine: "underline",
  },
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
