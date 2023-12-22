import React from 'react';
import { View, Text } from 'react-native';

const HomeBlog = ({ route }) => {
  const { currentid } = route.params;

  return (
    <View>
      <Text>Bienvenue sur la page d'accueil, utilisateur {currentid.} !</Text>
      {/* Ajoutez d'autres composants et fonctionnalités en fonction de vos besoins */}
    </View>
  );
};

export default HomeBlog;
