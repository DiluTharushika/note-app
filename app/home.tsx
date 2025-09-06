import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Animated,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User");
  const [searchText, setSearchText] = useState("");
  const [signOutModalVisible, setSignOutModalVisible] = useState(false); // <-- new state

  const fadeWelcome = useRef(new Animated.Value(0)).current;
  const fadeSearch = useRef(new Animated.Value(0)).current;
  const fadeList = useRef(new Animated.Value(0)).current;
  const fadeAddButton = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeWelcome, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeSearch, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeList, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(fadeAddButton, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchUser = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) setUserName(userDoc.data().name || "User");
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchNotes = () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    const q = query(collection(db, "notes"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesList: any[] = [];
        snapshot.forEach((doc) => notesList.push({ id: doc.id, ...doc.data() }));
        setNotes(notesList);
        setFilteredNotes(notesList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notes:", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
      const unsubscribe = fetchNotes();
      return () => unsubscribe && unsubscribe();
    }, [])
  );

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter((note) =>
        note.text.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  }, [searchText, notes]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const timestamp = item.createdAt?.toDate ? item.createdAt.toDate() : null;
    const dateStr = timestamp ? timestamp.toLocaleDateString() : "Unknown";
    const timeStr = timestamp
      ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

    return (
      <Animated.View
        style={{
          opacity: fadeList,
          transform: [
            { translateY: fadeList.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          ],
        }}
      >
        <TouchableOpacity
          style={styles.noteCard}
          onPress={() => router.push(`/noteDetail?id=${item.id}`)}
        >
          <Text style={styles.noteText}>{item.text}</Text>
          <View style={styles.noteFooter}>
            <Text style={styles.noteDate}>{dateStr}</Text>
            <Text style={styles.noteTime}>{timeStr}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Welcome and SignOut */}
        <View style={styles.headerRow}>
          <Animated.Text
            style={[
              styles.welcomeText,
              {
                opacity: fadeWelcome,
                transform: [
                  { translateY: fadeWelcome.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                ],
              },
            ]}
          >
            Welcome Back, 
          </Animated.Text>

          <TouchableOpacity onPress={() => setSignOutModalVisible(true)} style={styles.signOutButton}>
            <Feather name="log-out" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: fadeSearch,
              transform: [
                { translateY: fadeSearch.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              ],
            },
          ]}
        >
          <Feather name="search" size={20} color="#fff" style={{ marginLeft: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchText}
            onChangeText={setSearchText}
          />
        </Animated.View>

        <View style={{ flex: 1 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
          ) : filteredNotes.length === 0 ? (
            <Text style={styles.noNotesText}>No notes found.</Text>
          ) : (
            <FlatList
              data={filteredNotes}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 200, marginTop: 10 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Fixed Add Button */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 40,
            right: 25,
            opacity: fadeAddButton,
            transform: [{ scale: fadeAddButton }],
          }}
        >
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/addNote")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Custom Sign Out Modal */}
        <Modal
          transparent
          visible={signOutModalVisible}
          animationType="fade"
          onRequestClose={() => setSignOutModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Sign Out</Text>
              <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#444" }]}
                  onPress={() => setSignOutModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#ff4d4d" }]}
                  onPress={handleSignOut}
                >
                  <Text style={styles.modalButtonText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 35 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: { fontSize: width * 0.055, fontWeight: "700", color: "#fff" },
  signOutButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: { flex: 1, height: 45, paddingHorizontal: 10, fontSize: 16, color: "#fff" },
  noteCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: width * 0.05,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteText: { fontSize: width * 0.045, color: "#fff", marginBottom: 8 },
  noteFooter: { flexDirection: "row", justifyContent: "space-between" },
  noteDate: { fontSize: width * 0.035, color: "#ffffffaa" },
  noteTime: { fontSize: width * 0.035, color: "#ffffffaa" },
  noNotesText: { textAlign: "center", marginTop: 50, color: "#fff" },
  addButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    top: -80,
  },
  addButtonText: { color: "#fff", fontSize: 40, fontWeight: "bold" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#203a43",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 10 },
  modalMessage: { fontSize: 16, color: "#fff", marginBottom: 20, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
