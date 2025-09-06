// app/noteDetail.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedText, setEditedText] = useState("");

  // Custom alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  // Animation refs
  const fadeCard = useRef(new Animated.Value(0)).current;
  const fadeActions = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fadeCard, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(fadeActions, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const showAlert = (message: string, type: "success" | "error" = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  // Fetch note details
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const docRef = doc(db, "notes", id!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNote({ id: docSnap.id, ...docSnap.data() });
        } else {
          showAlert("Note not found", "error");
          setTimeout(() => router.back(), 1500);
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        showAlert("Failed to fetch note details", "error");
      }
    };
    if (id) fetchNote();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "notes", id!));
      showAlert("Note has been deleted", "success");
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error("Error deleting note:", error);
      showAlert("Failed to delete note", "error");
    }
  };

  const handleEdit = async () => {
    if (!note) return;
    if (!editedText.trim()) {
      showAlert("Note cannot be empty", "error");
      return;
    }
    try {
      await updateDoc(doc(db, "notes", id!), { text: editedText });
      setNote({ ...note, text: editedText });
      setEditModalVisible(false);
      showAlert("Note has been updated", "success");
    } catch (error) {
      console.error("Error updating note:", error);
      showAlert("Failed to update note", "error");
    }
  };

  if (!note) {
    return (
      <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
        <Text style={styles.header}>Loading note...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeCard,
          transform: [
            { translateY: fadeCard.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          ],
        }}
      >
        <Text style={styles.header}>Note Detail</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Note</Text>
          <Text style={styles.description}>{note.text}</Text>

          <Text style={styles.label}>Created</Text>
          <Text style={styles.description}>
            {note.createdAt?.toDate
              ? note.createdAt.toDate().toLocaleString()
              : "Unknown"}
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        style={{
          opacity: fadeActions,
          transform: [{ scale: fadeActions }],
        }}
      >
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => {
              setEditedText(note.text);
              setEditModalVisible(true);
            }}
            style={styles.iconButton}
          >
            <Feather name="edit" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Feather name="trash-2" size={28} color="#F87171" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Note</Text>
            <TextInput
              style={styles.input}
              value={editedText}
              onChangeText={setEditedText}
              placeholder="Edit your note"
              placeholderTextColor="rgba(255,255,255,0.6)"
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Alert */}
      <Modal visible={alertVisible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <LinearGradient
            colors={
              alertType === "success"
                ? ["#052720ff", "#20917eff"]
                : ["#c0392b", "#e74c3c"]
            }
            style={styles.alertBox}
          >
            <Text style={styles.alertText}>{alertMessage}</Text>
            <TouchableOpacity
              onPress={() => setAlertVisible(false)}
              style={styles.alertButton}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 20, textAlign: "center", paddingTop: 20 },
  card: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 15, padding: 25, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  label: { fontWeight: "bold", fontSize: 16, color: "#fff", marginTop: 15 },
  description: { marginTop: 8, fontSize: 16, color: "#fff", lineHeight: 22 },
  actions: { flexDirection: "row", justifyContent: "space-around", marginTop: 30 },
  iconButton: { backgroundColor: "rgba(255,255,255,0.15)", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "rgba(1, 44, 16, 0.97)", borderRadius: 15, padding: 30, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#fff" },
  input: { borderColor: "rgba(255,255,255,0.3)", borderWidth: 1, borderRadius: 12, minHeight: 60, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, color: "#fff", backgroundColor: "rgba(255,255,255,0.15)", textAlignVertical: "top" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  modalButton: { flex: 1, backgroundColor: "rgba(159, 165, 164, 0.44)", padding: 15, borderRadius: 12, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  alertOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  alertBox: { width: 300, borderRadius: 15, padding: 25, alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.3)" },
  alertText: { color: "#fff", fontSize: 16, marginBottom: 20, textAlign: "center" },
  alertButton: { backgroundColor: "rgba(27, 9, 9, 0.18)", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  alertButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
