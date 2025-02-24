import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Hot Screen!</Text>
      
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('ReportSubmission')} 
        style={styles.button}
      >
        Submit Report
      </Button>

      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('ReportsList')} 
        style={styles.button}
      >
        View Reports
      </Button>

      <Button 
        mode="outlined" 
        onPress={() => navigation.navigate('Map')} 
        style={styles.backButton}
      >
        Back to Map
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Light background
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    width: '80%',
    marginVertical: 10,
  },
  backButton: {
    marginTop: 20,
    borderColor: '#6200ee', // Purple border
  },
});

export default HomeScreen;
