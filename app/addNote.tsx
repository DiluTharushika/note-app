// app/addNote.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddNote() {
  const navigation = useNavigation();
  const [noteText, setNoteText] = useState("");

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      Alert.alert("Error", "Please enter a note.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      const noteData = {
        text: noteText.trim(),
        uid: user.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "notes"), noteData);
      Alert.alert("Success", "Note added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding note:", error);
      Alert.alert("Error", "Failed to add note. Please try again.");
    }
  };

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
    justifyContent: "center",
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
  },
  label: { color: "#fff", fontSize: 14, marginBottom: 5, marginLeft: 5 },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)", // glass effect
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
    backgroundColor: "rgba(255,255,255,0.25)", // glass-style button
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
});
