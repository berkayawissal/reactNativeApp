import React from 'react';
import { View, Text, Button,TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firebase from '../Config/Index';
const auth = firebase.auth(); // Importation de l'objet auth depuis Firebase

const HomeBlog = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Appel de la fonction de déconnexion de Firebase
      navigation.navigate('Login'); // Redirection vers la page de connexion
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur l'Application</Text>
      <TouchableOpacity style={styles.buttonStyle} onPress={handleLogout}>
          <Text style={styles.login}>Déconnexion</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: "#7D4A86",
    textAlign: "left",
    fontWeight: "bold",
    marginTop: 80,
    marginBottom: 50,
    fontStyle: "italic",
    fontFamily: 'Roboto',
    fontSize: 30,
  },
  login: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
},

  buttonStyle: {
    color: "#7D4A86",
        backgroundColor: "#BC6FCA",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
  },
});

export default HomeBlog;
