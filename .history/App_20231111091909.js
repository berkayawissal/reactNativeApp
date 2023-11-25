import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style= {styles.Text}>Authentification</Text>
      <StatusBar style="auto" />
      <TextInput style= {styles.input}></TextInput>
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
    marginTop: 20,
    borderRadius: 10,
    paddingLeft: 30,
    fontSize: 16,
  },
  Text:{
    color:"#9C27B0",
    textAlign:"left",
    fontWeight:"bold",
    fontStyle:"italic",
    fontFamily:'Roboto',
    fontSize: 6,
  },

  
});
