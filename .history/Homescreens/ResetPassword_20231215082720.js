import React, { useState } from 'react';
import { Button, View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firebase from '../Config';

const auth = firebase.auth();

const ResetPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleResetPassword = () => {
    auth
      .sendPasswordResetEmail(email)
      .then(() => {
        setSuccessMessage('Password reset email sent. Please check your inbox.');
        // Navigate back to the login screen
        //navigation.navigate('Login');
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const back = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground source={require('./../assets/bg.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
        <TouchableOpacity style={styles.backButton} onPress={back}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  input: {
    width: 450,
    height: 50,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  resetButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  successText: {
    color: 'green',
    marginBottom: 10,
  },
});

export default ResetPassword;
