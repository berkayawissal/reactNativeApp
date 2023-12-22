import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import firebase from '../Config/Index';
const auth=firebase.auth();
const Login = (props) => {
    const handleCreateAccount = () => {
      props.navigation.navigate('Signup');
    };
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const handleHome = () => {

    
        auth.signInWithEmailAndPassword(email, password)
        .then(()=>{
          props.navigation.navigate('Home',{
            currentid:auth.currentUser.uid,
          });
  
        }).catch(err => {alert(err)})
      
      
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
      <Text style= {styles.Text}>Login</Text>
      <StatusBar style="auto" />
      <TextInput style= {styles.input} placeholder='Email'  onChangeText={(text) => setEmail(text)}
            value={email}></TextInput>
      <TextInput style= {styles.input} secureTextEntry={true}  onChangeText={(text) => setPassword(text)}
            value={password} placeholder='Password'></TextInput>
            <TouchableOpacity style={styles.loginButton} onPress={handleHome}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
      <Button style= {styles.Button}>Quit</Button>
      <TouchableOpacity onPress={handleCreateAccount}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>      </View>
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

export default Login;