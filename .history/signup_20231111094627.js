import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export default function Signup() {
  return (
    <ImageBackground
      source={require('./assets/images.jpg')}
      style={styles.container}>
      <Text style= {styles.Text}>Signup</Text>
      <StatusBar style="auto" />
      <TextInput style= {styles.input} placeholder='Email'></TextInput>
      <TextInput style= {styles.input}placeholder='Phone Number'></TextInput>
      <TextInput style= {styles.input}placeholder='Password'></TextInput>
      <TextInput style= {styles.input}placeholder='Check Password'></TextInput>
      <Button style= {styles.Button}>Signup</Button>
      <Button style= {styles.Button}>Quit</Button>
      <TouchableOpacity><Text >Login</Text></TouchableOpacity>
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
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 10,
    paddingLeft: 30,
    fontSize: 16,
  },
  Text:{
    color:"#9C27B0%",
    textAlign:"left",
    fontWeight:"bold",
    marginTop: 80,
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
    color: "#ffff",
    backgroundColor:"#BC6FCA",
  } 
});
