// app/home.tsx
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
  const [userName, setUserName] = useState<string>("User");
  const [searchText, setSearchText] = useState("");

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

  const renderItem = ({ item }: { item: any }) => {
    const timestamp = item.createdAt?.toDate ? item.createdAt.toDate() : null;
    const dateStr = timestamp ? timestamp.toLocaleDateString() : "Unknown";
    const timeStr = timestamp ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 35 },
  welcomeText: { fontSize: width * 0.065, fontWeight: "700", color: "#fff", marginBottom: 5 },
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
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    top: -70,
  },
  addButtonText: { color: "#fff", fontSize: 40, fontWeight: "bold" },
});
