import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export default function App() {
  return (
    <ImageBackground
      source={require('./assets/images.jpg')}
      style={styles.container}>
        <View style={styles.header}>
      <Text style= {styles.Text}>Login</Text>
      <StatusBar style="auto" />
      <TextInput style= {styles.input} placeholder='Email'></TextInput>
      <TextInput style= {styles.input}placeholder='Password'></TextInput>
      <Button style= {styles.Button}>Login</Button>
      <Button style= {styles.Button}>Quit</Button>
      <TouchableOpacity><Text >Create new user</Text></TouchableOpacity>
      
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    
    justifyContent: 'center-top',
  },
  input: {
    width: "80%",
    height: 45,
    marginBottom: 30,
    borderRadius: 10,
    paddingLeft: 30,
    fontSize: 16,
  },
  Text:{
    color:"#9C27B0",
    textAlign:"left",
    fontWeight:"bold",
    marginTop: 80,
    marginBottom: 50,
    fontStyle:"italic",
    fontFamily:'Roboto',
    fontSize: 30,
  },
  Button:{
    width: "80%",
    height: 45,
    marginBottom: 15,
    borderRadius: 10,
    paddingLeft: 30,
    fontSize: 16,
    position: "center",
    color: "#ffff",
    backgroundColor:"#BC6FCA",
  } 
});
