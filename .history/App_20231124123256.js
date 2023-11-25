import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export default function App() {
  const email=wissal;
  const password=123;
  const { em,setmail}= useState("wiss");

  return (
    <ImageBackground
      source={require('./assets/images.jpg')}
      style={styles.container}>
        <View style={{
            backgroundColor:"#0005",
            borderRadius:18,
            width:"80%",
            height:500,
            alignItems: 'center',
            justifyContent: 'flex-start',
         
        }}>
      <Text style= {styles.Text}>Login</Text>
      <StatusBar style="auto" />
      <TextInput style= {styles.input} placeholder='Email'></TextInput>
      <TextInput style= {styles.input} secureTextEntry={true} placeholder='Password'></TextInput>
      <Button style= {styles.Button}>Login</Button>
      <Button style= {styles.Button}>Quit</Button>
      <TouchableOpacity><Text >Create new user</Text></TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    height: "100%",
  },
  input: {
    onChangeText={(Text)=> setmail()}
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
