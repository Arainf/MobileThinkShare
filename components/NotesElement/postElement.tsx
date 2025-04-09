import { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";

interface Note {
  author: string;
  date: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

export default function PostElement({ note }: { note: Note }) {
    const [isLoading, setIsLoading] = useState(true);

    return (
      <View style={styles.post}>
        {/* Fallback Placeholder */}
        {isLoading && (
          <View style={styles.placeholder}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
  
        {/* Actual Content */}
        {!isLoading && (
          <>
            {/* Header: Author and Date */}
            <View style={styles.header}>
              <View style={styles.profileContainer}>
                <Text style={styles.profileText}>{note.author[0]}</Text>
              </View>
              <View>
                <Text style={styles.author}>{note.author}</Text>
                <Text style={styles.date}>{note.date}</Text>
              </View>
            </View>
  
            {/* Content */}
            <Text style={styles.content}>{note.content}</Text>
  
            {/* Image */}
            {note.image && (
              <Image
                source={{ uri: note.image }}
                style={styles.image}
                onLoadEnd={() => setIsLoading(false)} // Stop loading when the image is loaded
              />
            )}
  
            {/* Footer: Likes and Comments */}
            <View style={styles.footer}>
              <TouchableOpacity>
                <Text style={styles.footerText}>👍 {note.likes} Likes</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.footerText}>💬 {note.comments} Comments</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    post: {
      backgroundColor: "#fff",
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    placeholder: {
      justifyContent: "center",
      alignItems: "center",
      height: 200, // Placeholder height
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    profileContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#3b82f6",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    profileText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    author: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#374151",
    },
    date: {
      fontSize: 12,
      color: "#888",
    },
    content: {
      fontSize: 14,
      color: "#333",
      marginBottom: 12,
    },
    image: {
      width: "100%",
      height: 200,
      borderRadius: 8,
      marginBottom: 12,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerText: {
      fontSize: 14,
      color: "#374151",
    },
  });