import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Replace with your backend URL (use local IP for emulator)
const SERVER_URL = 'http://192.168.1.68:5000'; // Update with your actual Flask server URL

const SignupScreen = () => {
  const [telegramName, setTelegramName] = useState('');
  const [telegramNumber, setTelegramNumber] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (!telegramName || !telegramNumber || !gmail || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const payload = {
      drivername: telegramName,
      email: gmail,
      vehicleno: "N/A", // Modify this if vehicle number is needed
      telegram_phone: telegramNumber,
      password: password,
    };

    try {
      const response = await fetch(`${SERVER_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'User registered successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', data.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Network request failed. Please check your internet and server connection.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/signup.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.helloContainer}>
            <Text style={styles.helloText}>Sign Up</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Telegram Name */}
            <View style={styles.inputContainer}>
              <Icon name="user" size={20} color="#666" style={styles.icon} />
              <TextInput
                placeholder="Telegram Name"
                style={styles.input}
                placeholderTextColor="#888"
                value={telegramName}
                onChangeText={setTelegramName}
              />
            </View>

            {/* Telegram Number */}
            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color="#666" style={styles.icon} />
              <TextInput
                placeholder="Telegram Number"
                style={styles.input}
                placeholderTextColor="#888"
                value={telegramNumber}
                onChangeText={setTelegramNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* Gmail */}
            <View style={styles.inputContainer}>
              <Icon name="envelope" size={20} color="#666" style={styles.icon} />
              <TextInput
                placeholder="Gmail"
                style={styles.input}
                placeholderTextColor="#888"
                value={gmail}
                onChangeText={setGmail}
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#666" style={styles.icon} />
              <TextInput
                placeholder="Password"
                style={styles.input}
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <LinearGradient
              colors={['#f97794', '#623AA2']}
              style={styles.linearGradient}
            >
              <Text style={styles.signUpButtonText}>
                Create <Icon name="arrow-right" size={20} color="#fff" />
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Already have an account? */}
          <TouchableOpacity
            style={styles.loginContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for better text readability
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  helloContainer: {
    alignItems: 'center',
  },
  helloText: {
    fontSize: 50,
    fontWeight: '500',
    color: '#fff',
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    padding: 10,
    marginVertical: 10,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#262626',
  },
  signUpButton: {
    marginVertical: 20,
    borderRadius: 30,
    alignSelf: 'center', // Center the button properly
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  loginLink: {
    color: '#FFD700',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  linearGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
