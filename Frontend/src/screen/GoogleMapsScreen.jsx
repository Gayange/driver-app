import React, { useEffect, useState } from 'react';
import { View, Text, Button, Linking, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

export default function GoogleMapsScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set a predefined destination (e.g., San Francisco coordinates)
  const destinationLatitude = 37.7749;
  const destinationLongitude = -122.4194;

  // Get the current location when the component mounts
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        setErrorMsg('Failed to get location');
      }

      setLoading(false);
    })();
  }, []);

  // Function to handle opening Google Maps with directions
  const openGoogleMapsDirections = () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destinationLatitude},${destinationLongitude}`;
      Linking.openURL(googleMapsUrl).catch((err) =>
        console.error("Failed to open Google Maps", err)
      );
    } else {
      Alert.alert('Location not available', 'Please try again later');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text>Google Maps Directions</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : errorMsg ? (
        <Text style={{ color: 'red' }}>{errorMsg}</Text>
      ) : (
        <Text>Your current location: {location ? `${location.coords.latitude}, ${location.coords.longitude}` : 'Loading...'}</Text>
      )}

      <Button title="Open Directions in Google Maps" onPress={openGoogleMapsDirections} />
    </View>
  );
}
