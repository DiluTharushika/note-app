// app/home.tsx
import React, { useState, useCallback, useEffect } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [searchText, setSearchText] = useState("");

  const fetchUser = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().name || "User");
      }
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
        snapshot.forEach((doc) => {
          notesList.push({ id: doc.id, ...doc.data() });
        });
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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => router.push(`/noteDetail?id=${item.id}`)}
    >
      <Text style={styles.noteText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.welcomeText}>
          Welcome {userName || "to NOTEZY"}!
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#fff" style={{ marginLeft: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
        ) : filteredNotes.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 50, color: "#fff" }}>
            No notes found.
          </Text>
        ) : (
          <FlatList
            data={filteredNotes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/addNote")}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 35 },

  welcomeText: {
    fontSize: width * 0.055,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 15,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    height: 45,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#fff",
  },

  list: { paddingBottom: 140, marginTop: 10 },

  noteCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: width * 0.05,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteText: {
    fontSize: width * 0.045,
    color: "#fff",
  },

  // Replace addButton styles with this
addButton: {
  position: "absolute",
  bottom: 120,
  right: 30,
  width: 70,
  height: 70,
  borderRadius: 35,
  backgroundColor: "rgba(255,255,255,0.15)", // semi-transparent to match background
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.2)", // subtle border
},
addButtonText: {
  color: "#fff",
  fontSize: 40,
  fontWeight: "bold",
},

});
