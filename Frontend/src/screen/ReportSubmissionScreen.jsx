import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Appbar, Card, Menu, Divider, Provider } from 'react-native-paper'; // Imported Provider here
import * as Location from 'expo-location';

const ReportSubmissionScreen = ({ navigation }) => {
  const [issueType, setIssueType] = useState('');
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // Get the current location when the component mounts
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLatitude(currentLocation.coords.latitude);
      setLongitude(currentLocation.coords.longitude);

      // Set the location string for the user to see
      setLocation(`${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`);
    })();
  }, []);

  const handleSubmit = async () => {
    if (!latitude || !longitude || !issueType || !subject) {
      Alert.alert('Please fill all fields!');
      return;
    }

    const reportData = {
      issue_type: issueType,
      latitude: latitude,
      longitude: longitude,
      subject: subject,
    };

    const response = await fetch('http://192.168.1.68:5000/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });

    if (response.ok) {
      Alert.alert('Report Submitted!');
      navigation.navigate('ReportsList');
    } else {
      Alert.alert('Failed to submit report.');
    }
  };

  return (
    <Provider>  {/* Added Provider wrapper here */}
      <View style={styles.container}>
        {/* Header */}
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Submit Report" />
          <Appbar.Action icon="file-document" onPress={() => navigation.navigate('ReportsList')} />
        </Appbar.Header>

        {/* Form Section */}
        <Card style={styles.card}>
          <Card.Content>
            {/* Issue Type Dropdown */}
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuButton}
                >
                  <Text>{issueType || "Select Issue Type"}</Text>  {/* Wrapped the text inside <Text> */}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setIssueType("Roadblock"); setMenuVisible(false); }} title={<Text>Roadblock</Text>} />  {/* Wrapped text in <Text> */}
              <Divider />
              <Menu.Item onPress={() => { setIssueType("Accident"); setMenuVisible(false); }} title={<Text>Accident</Text>} />  {/* Wrapped text in <Text> */}
              <Divider />
              <Menu.Item onPress={() => { setIssueType("Heavy Traffic"); setMenuVisible(false); }} title={<Text>Heavy Traffic</Text>} />  {/* Wrapped text in <Text> */}
            </Menu>

            <TextInput
              label="Subject"
              value={subject}
              onChangeText={setSubject}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Location"
              value={location}
              mode="outlined"
              style={styles.input}
              disabled
            />

            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              style={styles.submitButton}
            >
              <Text>Submit Report</Text>  {/* Wrapped the text inside <Text> */}
            </Button>
          </Card.Content>
        </Card>
      </View>
    </Provider>  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    margin: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 10,
  },
  menuButton: {
    marginBottom: 15,
    paddingVertical: 10,
  },
});

export default ReportSubmissionScreen;
