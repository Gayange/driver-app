import React from 'react';
import { View, Text, Button } from 'react-native';

const ReportDetailsScreen = ({ route, navigation }) => {
  const { report } = route.params;

  const handleConfirm = async () => {
    await fetch(`http://192.168.1.68:5000/report/${report.id}/confirm`, { method: 'POST' });
    alert('Report Confirmed!');
    navigation.goBack();
  };

  const handleDelete = async () => {
    await fetch(`http://192.168.1.68:5000/${report.id}/delete`, { method: 'DELETE' });
    alert('Report Deleted!');
    navigation.goBack();
  };

  return (
    <View>
      <Text>Subject: {report.subject}</Text>
      <Text>Type: {report.issueType}</Text>
      <Text>Location: {report.location}</Text>
      <Button title="Confirm Report" onPress={handleConfirm} />
      <Button title="Delete Report" onPress={handleDelete} />
    </View>
  );
};

export default ReportDetailsScreen;
