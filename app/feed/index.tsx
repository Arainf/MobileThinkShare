import React from "react";
import { FlatList, StyleSheet } from "react-native";
import PostElement from "@/components/NotesElement/postElement";
import { DATA } from "@/assets/sampledata";

export default function Feed() {
  return (
    <FlatList
      data={DATA}
      renderItem={({ item }) => <PostElement note={item} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
});