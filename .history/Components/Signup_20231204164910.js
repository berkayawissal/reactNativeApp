import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import firebase from '../Config/Index';

const auth=firebase.auth();

const Signup = (props) => {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmmotDePasse, setconfirmmotDePasse] = useState('');
  
    const handleInscription = () => {
  
      if(motDePasse === confirmmotDePasse) {
        auth.createUserWithEmailAndPassword(email, motDePasse)
        .then(()=>{
          props.navigation.navigate('Home');
  
        }).catch(err => {alert(err)})
      }
      // Handle inscription logic here
      // Add your inscription logic
    };
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
      <Text style= {styles.Text}>Signup</Text>
      <StatusBar style="auto" />

      <TextInput 
      style= {styles.input} 
      placeholder='Email'
      onChangeText={(text) => setEmail(text)}
          value={email}>
      </TextInput>

      <TextInput style= {styles.input}
        onChangeText={(text) => setMotDePasse(text)}
        value={motDePasse}
        secureTextEntry={true} 
       placeholder='Password'
       ></TextInput>

      <TextInput style= {styles.input} 
      secureTextEntry={true} 
      placeholder='Check Password'
      onChangeText={(text) => setconfirmmotDePasse(text)}
      value={confirmmotDePasse}
      ></TextInput>

        <TouchableOpacity style={styles.createAccountButton} onPress={handleInscription}>
          <Text style={styles.Button}>S'inscrire</Text>
        </TouchableOpacity>
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
Signup
