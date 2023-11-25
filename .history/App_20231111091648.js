import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Authentification</Text>
      <StatusBar style="auto" />
      <TextInput style=></TextInput>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: "80%",
    height: 45,
    marginBottom: 20,
    borderRadius: 30,
    paddingLeft: 30,
    fontSize: 16,
  },
});
