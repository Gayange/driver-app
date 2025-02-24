import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Button, Card, Title, Paragraph } from 'react-native-paper';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAtXPDlFXzZTuarUgQPX-SOMD8wbQve5CM';  // Replace with your actual API key

const ReportsListScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch('http://192.168.1.68:5000/reports')
      .then(response => response.json())
      .then(data => setReports(data))
      .catch((error) => console.error('Error fetching reports:', error));
  }, []);

  const getLocation = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return 'Location not found';
    } catch (error) {
      console.error('Error getting location:', error);
      return 'Location error';
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Home')}
        style={styles.backButton}
      >
        Back to Home
      </Button>

      {/* Report List */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card
            style={styles.reportCard}
            onPress={() => navigation.navigate('ReportDetails', { report: item })}
          >
            <Card.Content style={styles.reportContent}>
              <Title style={styles.issueType}>{item.issue_type}</Title>
              <Paragraph style={styles.subject}>{item.subject}</Paragraph>
              <Paragraph style={styles.location}>
                Location: {item.latitude}, {item.longitude}
              </Paragraph>
              <Paragraph style={styles.location}>
                Address: {getLocation(item.latitude, item.longitude)}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  backButton: {
    marginBottom: 20,
  },
  reportCard: {
    marginBottom: 15,
    borderRadius: 8,
    elevation: 4,
  },
  reportContent: {
    padding: 15,
  },
  issueType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subject: {
    fontSize: 16,
    color: '#555',
    marginVertical: 5,
  },
  location: {
    fontSize: 14,
    color: '#777',
  },
});

export default ReportsListScreen;
