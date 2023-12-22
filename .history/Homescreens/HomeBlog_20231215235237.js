import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeBlog = () => {
  const navigation = useNavigation();

  const navigateToListProfile = () => {
    navigation.navigate('ListProfile');
  };

  const navigateToGroups = () => {
    navigation.navigate('Groups');
  };

  const navigateToMyAccount = () => {
    navigation.navigate('MyAccount');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur l'Application</Text>
      <Button title="Liste des Profils" onPress={navigateToListProfile} />
      <Button title="Groupes" onPress={navigateToGroups} />
      <Button title="Mon Compte" onPress={navigateToMyAccount} />
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
