import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import firebase from '../Config/Index';

const List_Profile = (props) => {
  const database = firebase.database();
  const profilesRef = database.ref('Profils');
  const [profilesData, setProfilesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState([]);

  useEffect(() => {
    profilesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const profilesArray = Object.values(data);

        // Ajoutez une propriété 'id' unique à chaque profil
        const profilesWithId = profilesArray.map((profile, index) => ({
          ...profile,
          id: index.toString(), // Vous pouvez ajuster la création de 'id' selon vos besoins
        }));

        setProfilesData(profilesWithId);
        setFilteredProfiles(profilesWithId);
      }
    });
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);

    const searchWords = text.toLowerCase().split(' ');

    const filtered = profilesData.filter((profile) =>
      searchWords.every((word) =>
        profile.nom.toLowerCase().includes(word) ||
        profile.prenom.toLowerCase().includes(word) ||
        profile.tel.toLowerCase().includes(word)
      )
    );

    setFilteredProfiles(filtered);
  };

  const renderProfile = ({ item }) => (
    <View style={styles.profileItem}>
      <Image source={item.url ? item.url : require('../assets/user.png')} style={styles.profileImage} />

      <View style={styles.profileInfo}>
        <Text>{`${item.nom} ${item.prenom}`}</Text>
        <Text>{item.tel}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleDelete(item)}>
          <Text>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleCall(item)}>
          <Text>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleDelete = (item) => {
    // Handle delete action for the profile
    console.log('Deleting:', item);
  };

  const handleCall = (item) => {
    // Handle call action for the profile
    console.log('Calling:', item);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search profiles..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item.id} // Utilisez la propriété 'id' comme clé
        renderItem={renderProfile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 10, // Pour ajuster l'espace entre l'image et le texte
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    marginLeft: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default List_Profile;
