import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import firebase from '../Config/Index';

const auth = firebase.auth();

const Signup = (props) => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmmotDePasse, setconfirmmotDePasse] = useState('');

  const handleInscription = () => {

    if (motDePasse === confirmmotDePasse) {
      auth.createUserWithEmailAndPassword(email, motDePasse)
        .then(() => {
          props.navigation.navigate('Login');

        }).catch(err => { alert(err) })
    }
    // Handle inscription logic here
    // Add your inscription logic
  };
  const back = () => {
    props.navigation.navigate('Login');
  };
  return (
    <ImageBackground
      source={require('../assets/images.jpg')}
      style={styles.container}>
      <View style={{
        backgroundColor: "#0005",
        borderRadius: 18,
        width: "80%",
        height: 500,
        alignItems: 'center',
        justifyContent: 'flex-start',

      }}>
        <Text style={styles.textStyle}>Signup</Text>


        <TextInput
          style={styles.inputStyle}
          placeholder='Email'
          onChangeText={(text) => setEmail(text)}
          value={email}>
        </TextInput>

        <TextInput style={styles.inputStyle}
          onChangeText={(text) => setMotDePasse(text)}
          value={motDePasse}
          secureTextEntry={true}
          placeholder='Password'
        ></TextInput>

        <TextInput style={styles.inputStyle}
          secureTextEntry={true}
          placeholder='Check Password'
          onChangeText={(text) => setconfirmmotDePasse(text)}
          value={confirmmotDePasse}
        ></TextInput>

        <TouchableOpacity style={styles.createAccountButton} onPress={handleInscription}>
          <Text style={styles.buttonStyle}>S'inscrire</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.back} onPress={back}>
          <Text style={styles.buttonText}>Back</Text>
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
    width: "100%",
    height: "100%",
  },
  inputStyle: {

    width: "80%",
    height: 45,
    marginBottom: 30,
    borderRadius: 10,
    paddingLeft: 30,
    fontSize: 16,
  },
  errorText: {
    marginTop: 15,
    color: '#7D5A68',
    fontSize: 11,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 10,
  },

  textStyle: {
    color: "#7D4A86",
    textAlign: "left",
    fontWeight: "bold",
    marginTop: 80,
    marginBottom: 50,
    fontStyle: "italic",
    fontFamily: 'Roboto',
    fontSize: 30,
  },
  buttonStyle: {
    width: "100%",
    height: 45,
    marginBottom: 15,
    borderRadius: 10,
    paddingLeft: 30,
    fontSize: 16,
    position: "center",
    color: "#white",
    backgroundColor: "#BC6FCA",
  },
  forget: {
    marginTop: 15,
    color: 'white',
    fontSize: 16,
    backgroundColor: '#D2B5FA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  }
});
export default Signup;
