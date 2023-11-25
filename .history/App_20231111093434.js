import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style= {styles.Text}>Authentification</Text>
      <StatusBar style="auto" />
      <TextInput style= {styles.input} placeholder='Email'></TextInput>
      <TextInput style= {styles.input}placeholder='Password'></TextInput>
      <Button style= {styles.Button}>Login</Button>
      <Button style= {styles.Button}>Quit</Button>
      <TouchableOpacity><Text >Create new user</Text></TouchableOpacity>
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
    position to
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
    fontSize: 30,
  },
  Button:{
    width: "80%",
    height: 45,
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 10,
    paddingLeft: 30,
    fontSize: 16,
    backgroundColor:"#BC6FCA",
  } 
});
