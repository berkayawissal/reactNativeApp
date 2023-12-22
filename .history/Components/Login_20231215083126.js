import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import firebase from '../Config';
const auth = firebase.auth();
const Login = (props) => {
  const handleCreateAccount = () => {
    props.navigation.navigate('Signup');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleHome = async () => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      props.navigation.navigate('Home', { currentid: uid });
    } catch (error) {
      setError('Invalide Email or Password !'); // Set error message if authentication fails
    }
  };

  const handleForgotPassword = () => {
    props.navigation.navigate('ResetPassword');
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
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity style={styles.buttonStyle} onPress={handleHome}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreateAccount}>
          <Text style={styles.createAccountText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forget}>Forgot Password?</Text>
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
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 10,
  },
  forgotPasswordText: {
    marginTop: 15,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'grey',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
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
  },
  forget: {
    marginTop: 15,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'orange',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  }
});

export default Login;