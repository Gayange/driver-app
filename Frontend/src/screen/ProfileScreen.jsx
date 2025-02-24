import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const ProfileScreen = ({ route }) => {
  const { userProfile } = route.params;
  const [profileData, setProfileData] = useState(userProfile);

  useEffect(() => {
    if (!profileData) {
      // Fetch profile info if needed
      // For now, assume `userProfile` is passed from the previous screen
    }
  }, [profileData]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: profileData?.profileImage || "" }}
        style={styles.profileImage}
      />
      <Text style={styles.name}>{profileData?.name || "User"}</Text>
      <Text style={styles.email}>{profileData?.email || "No Email"}</Text>
      {/* Add more profile data here as necessary */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#262626",
  },
  email: {
    fontSize: 18,
    color: "#555",
  },
});

export default ProfileScreen;
