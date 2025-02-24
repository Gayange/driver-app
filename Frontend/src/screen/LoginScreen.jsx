import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  // Linking,  // Uncomment if you plan to use Linking for Google Sign-In later
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      const response = await fetch("http://192.168.1.68:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", data.message);
        navigation.navigate("Map");
      } else {
        Alert.alert("Login Failed", data.error || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while logging in.");
      console.error("Login error:", error);
    }
  };

  // Commented out Google Sign In for now
  // const handleGoogleSignIn = () => {
  //   const backendUrl = "http://your-backend-url/google/google"; // Replace with your backend URL
  //   Linking.openURL(backendUrl).catch((err) =>
  //     console.error("Failed to open URL: ", err)
  //   );
  // };

  return (
    <View style={styles.container}>
      <View style={styles.topImageContainer}>
        <Image
          source={require("../assets/topVector.png")}
          style={styles.topImage}
        />
      </View>

      <View style={styles.helloContainer}>
        <Text style={styles.helloText}>Hello</Text>
      </View>

      <View>
        <Text style={styles.signInText}>Sign in to your account</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Email"
            style={styles.input}
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Password"
            style={styles.input}
            placeholderTextColor="#888"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <LinearGradient
          colors={["#f97794", "#623AA2"]}
          style={styles.linearGradient}
        >
          <Text style={styles.signInButtonText}>
            Sign In <Icon name="arrow-right" size={20} color="#fff" />
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/*
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
        <LinearGradient
          colors={["#4285F4", "#34A853"]}
          style={styles.linearGradient}
        >
          <Text style={styles.googleButtonText}>
            <Icon name="google" size={20} color="#fff" /> Sign in with Google
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      */}

      <TouchableOpacity
        style={styles.signupContainer}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.signupText}>
          Don’t have an account? <Text style={styles.signupLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    flex: 1,
    paddingHorizontal: 0,
  },
  topImageContainer: {},
  topImage: {
    width: "100%",
    height: 130,
  },
  helloContainer: {
    marginTop: 30,
  },
  helloText: {
    textAlign: "center",
    fontSize: 70,
    fontWeight: "500",
    color: "#262626",
  },
  signInText: {
    textAlign: "center",
    fontSize: 18,
    color: "#262626",
  },
  formContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#262626",
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 12,
    marginVertical: 10,
    marginHorizontal: 20,
    backgroundColor: "transparent",
    borderRadius: 30,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 30,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    fontSize: 16,
    color: "#888",
    fontWeight: "bold",
  },
  signupLink: {
    color: "#007BFF",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  linearGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});

export default LoginScreen;
