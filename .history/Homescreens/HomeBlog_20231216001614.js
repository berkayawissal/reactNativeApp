import React, { useContext } from 'react'; // Ajoutez cette ligne
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../path/to/your/auth/context'; // Remplacez le chemin par le vrai chemin de votre contexte d'authentification

const HomeBlog = () => {
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext); // Assurez-vous d'avoir un contexte d'authentification avec une fonction signOut

  const handleLogout = () => {
    // Appel de la fonction de déconnexion du contexte d'authentification
    signOut();
    // Redirection vers la page de connexion (ou toute autre page appropriée)
    navigation.navigate('SignIn'); // Remplacez 'SignIn' par le nom de votre page de connexion
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
