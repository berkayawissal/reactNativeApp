import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import firebase from '../Config/Index';
const auth = firebase.auth();
const Login = (props) => {
  const handleCreateAccount = () => {
    props.navigation.navigate('Signup');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleHome = async () => {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;
    props.navigation.navigate('Home', {
      currentid: uid,
    });

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
        <Text style={styles.textStyle}>Login</Text>
        <TextInput style={styles.inputStyle} placeholder='Email' onChangeText={(text) => setEmail(text)}
          value={email}></TextInput>
        <TextInput style={styles.inputStyle} secureTextEntry={true} onChangeText={(text) => setPassword(text)}
          value={password} placeholder='Password'></TextInput>
        <TouchableOpacity style={styles.buttonStyle} onPress={handleHome}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreateAccount}>
          <Text style={styles.createAccountText}>Create Account</Text>
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
  textStyle: {
    color: "#9C27B0",
    textAlign: "left",
    fontWeight: "bold",
    marginTop: 80,
    marginBottom: 50,
    fontStyle: "italic",
    fontFamily: 'Roboto',
    fontSize: 30,
  },
  buttonStyle: {
    width: "80%",
    height: 45,
    marginBottom: 15,
    borderRadius: 10,
    paddingLeft: 30,
    fontSize: 16,
    position: "center",
    color: "#ffff",
    backgroundColor: "#BC6FCA",
  }
});

export default Login;