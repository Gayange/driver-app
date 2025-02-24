import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screen components
import LoginScreen from './src/screen/LoginScreen';
import SignupScreen from './src/screen/SignupScreen';
import MapScreen from './src/screen/MapScreen';
import HomeScreen from './src/screen/HomeScreen';
import ReportDetailsScreen from './src/screen/ReportDetailsScreen';
import ReportsListScreen from './src/screen/ReportsListScreen';
import ReportSubmissionScreen from './src/screen/ReportSubmissionScreen';
import GoogleMapsScreen from './src/screen/GoogleMapsScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Stack.Screen components */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
        <Stack.Screen name="ReportsList" component={ReportsListScreen} />
        <Stack.Screen name="ReportSubmission" component={ReportSubmissionScreen} />
        <Stack.Screen name="GoogleMaps" component={GoogleMapsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
