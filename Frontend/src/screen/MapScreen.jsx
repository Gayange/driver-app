import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, ActivityIndicator, TextInput, Modal, TouchableOpacity, FlatList, Linking, Image } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [trafficInfo, setTrafficInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState('');
  const [isModalVisible, setModalVisible] = useState(true);
  const [isBlurred, setIsBlurred] = useState(true);
  const [suggestedDestinations, setSuggestedDestinations] = useState([]);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [reports, setReports] = useState([]); // State to store reports data

  const googleMapsApiKey = 'AIzaSyAtXPDlFXzZTuarUgQPX-SOMD8wbQve5CM';  
  const placesApiKey = 'AIzaSyAtXPDlFXzZTuarUgQPX-SOMD8wbQve5CM';  

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Fetch reports data
      fetchReports();
    })();
  }, []);

  // Fetch reports data from the provided URL
  const fetchReports = async () => {
    try {
      const response = await axios.get('http://192.168.1.68:5000/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  // Function to get the appropriate icon based on the issue
  const getIconForIssue = (issue) => {
    switch (issue) {
      case 'Special Traffic Plan':
        return require('../assets/traffic.png'); // Icon for Special Traffic Plan
      case 'Accident':
        return require('../assets/accident.png'); // Icon for Accident
      case 'Roadblock':
        return require('../assets/roadwork.png'); // Icon for Roadblock
      default:
        return require('../assets/default.png'); // Default icon
    }
  };

  const getTrafficUpdates = async (destinationLat, destinationLng) => {
    if (!location) return;

    const origin = `${location.coords.latitude},${location.coords.longitude}`;
    const destination = `${destinationLat},${destinationLng}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${googleMapsApiKey}&traffic_model=best_guess&departure_time=now`;

    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        setRoute(decodedPoints);

        const trafficData = data.routes[0].legs[0];
        setTrafficInfo({
          distance: trafficData.distance.text,
          duration: trafficData.duration.text,
          durationInTraffic: trafficData.duration_in_traffic.text,
          summary: trafficData.summary,
        });
      } else {
        setErrorMessage('No routes found');
      }
    } catch (error) {
      setErrorMessage('Error fetching traffic updates');
    }
    setLoading(false);
  };

  const decodePolyline = (encoded) => {
    let points = [], index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let shift = 0, result = 0, byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;
      shift = 0; result = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const getPlaceSuggestions = async (query) => {
    if (!query) return;

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&location=${location.coords.latitude},${location.coords.longitude}&radius=5000&key=${placesApiKey}`;

    try {
      const response = await axios.get(url);
      if (response.data.predictions) {
        setSuggestedDestinations(response.data.predictions);
      }
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
    }
  };

  const handleDestinationChange = (text) => {
    setDestination(text);
    getPlaceSuggestions(text);
  };

  const fetchPlaceCoordinates = async (placeId) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${placesApiKey}`;

    try {
      const response = await axios.get(url);
      if (response.data.result) {
        const { lat, lng } = response.data.result.geometry.location;
        setDestinationCoords({ latitude: lat, longitude: lng });
        getTrafficUpdates(lat, lng); // Fetch traffic updates and route for new destination
      }
    } catch (error) {
      console.error('Error fetching place coordinates:', error);
    }
  };

  const handleSubmitDestination = (placeId) => {
    setIsBlurred(false); // Unblur map after submission
    setModalVisible(false); // Close modal after submission
    fetchPlaceCoordinates(placeId); // Fetch coordinates for selected destination
  };

  const handleGoBackToDestination = () => {
    setModalVisible(true); // Show the modal again
    setDestination(''); // Optionally reset the destination
    setRoute(null); // Reset the route when going back to the input modal
    setTrafficInfo(null); // Reset traffic info
    setSuggestedDestinations([]); // Clear place suggestions
    setDestinationCoords(null); // Clear destination coordinates
  };

  const openGoogleMapsDirections = (latitude, longitude) => {
    const url = `google.navigation:q=${latitude},${longitude}&key=${googleMapsApiKey}`;
    Linking.openURL(url).catch(err => console.error("Error opening Google Maps:", err));
  };

  if (!location && !errorMessage) return <Text>Loading...</Text>;
  if (errorMessage) return <Text>{errorMessage}</Text>;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={[styles.map, isBlurred && { filter: 'blur(10px)' }]} // Applying blur style
        region={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsTraffic={true}
      >
        <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} />
        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title="Destination"
            description="This is your selected destination"
          />
        )}
        {route && <Polyline coordinates={route} strokeWidth={6} strokeColor="blue" />}

        {/* Render markers for reports with different icons */}
        {reports.map((report, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: report.latitude, longitude: report.longitude }}
            title={report.subject}
            description={report.issue}
          >
            <Image
              source={getIconForIssue(report.issue)} // Get the appropriate icon based on the issue
              style={{ width: 30, height: 30 }}
            />
          </Marker>
        ))}
      </MapView>

      {/* Modal for user input */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.welcomeText}>Welcome, user! What's your destination?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter destination"
              value={destination}
              onChangeText={handleDestinationChange}
            />
            <FlatList
              data={suggestedDestinations}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSubmitDestination(item.place_id)}>
                  <Text>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.submitButton, !destination.trim() && styles.disabledButton]}
              onPress={() => handleSubmitDestination(suggestedDestinations[0].place_id)}
              disabled={!destination.trim()}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Display the destination after submission */}
      {!isModalVisible && destination && (
        <Text style={styles.destinationText}>Your destination: {destination}</Text>
      )}

      {/* Traffic info and loading indicator */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {trafficInfo && (
        <View style={styles.infoContainer}>
          <Text>Distance: {trafficInfo.distance}</Text>
          <Text>Duration: {trafficInfo.duration}</Text>
          <Text>Duration in Traffic: {trafficInfo.durationInTraffic}</Text>
          <Text>Traffic Summary: {trafficInfo.summary}</Text>
        </View>
      )}

      <Button title="Post a Traffic Update" onPress={() => navigation.navigate("Home")} />
      <Button title="Open Directions in Google Maps" onPress={() => openGoogleMapsDirections(destinationCoords.latitude, destinationCoords.longitude)} />
      <Button title="Back to Destination" onPress={handleGoBackToDestination} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  destinationText: {
    fontSize: 16,
    margin: 10,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginTop: 10,
  },
});

export default MapScreen;