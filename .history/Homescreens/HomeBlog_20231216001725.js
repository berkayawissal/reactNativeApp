import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'; // Assurez-vous d'avoir installé et configuré @react-native-firebase/auth

const HomeBlog = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await auth().signOut(); // Appel de la fonction de déconnexion de Firebase
      navigation.navigate('Login'); // Redirection vers la page de connexion
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur l'Application</Text>
      <Button title="Déconnexion" onPress={handleLogout} />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default HomeBlog;
