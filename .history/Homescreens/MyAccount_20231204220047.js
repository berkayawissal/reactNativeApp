import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Button, TextInput, Card } from 'react-native-paper';
import img from '../assets/user.png';
import * as ImagePicker from 'expo-image-picker';
import firebase from '../Config/Index';

// ...

const MyAccount = (props) => {
  const database = firebase.database();
  const [nom, setNom] = useState('berkaya');
  const [isDefault, setIsDefault] = useState(true);
  const [urlImage, setUrlImage] = useState('');
  const [prenom, setPrenom] = useState('wissal');
  const [tel, setTel] = useState('123456');

  // Fonctions de gestion des changements
  const handleNameChange = (text) => setNom(text);
  const handleSurnameChange = (text) => setPrenom(text);
  const handleTelChange = (text) => setTel(text);

  // ...

  const saveUserData = async () => {
    try {
      const url = await uploadImageToFirebase(urlImage);
      const refProfils = database.ref('profils');
      const key = refProfils.push().key;
      const refUnProfile = refProfils.child('profil' + key);

      // Utilisation de l'objet à envoyer plutôt qu'une chaîne
      refUnProfile.set({
        nom: nom,
        prenom: prenom,
        tel: tel,
        url: url,
      });

      // Vous pouvez également ajouter une confirmation ou une redirection ici
    } catch (error) {
      console.error('Error saving user data:', error.message);
      // Gestion de l'erreur ici (affichage d'un message à l'utilisateur, journalisation, etc.)
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setIsDefault(false);
        setUrlImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error.message);
    }
  };

  const uploadimagetofirebase=async(uriLocal) => {

//convertir image to blob
const blob=await imageToBlob(uriLocal);


//upload blob to firebase
const storage=firebase.storage();
const ref_mesimages=storage.ref("Mesimages");
const ref_image=ref_mesimages.child("image.jpg");
ref_image.put(blob);
//recuperer url
const url=ref_image.getDownloadURL();
return url;


  }


  return (
    <View style={styles.container}>

      <Text style={styles.title}>My Account</Text>

      {/* User Photo */}
      <TouchableOpacity onPress={async() =>{
          await pickImage();
      }}>
      <Image source={Isdefault?require('./../assets/user.png'):{uri:urlImage}} style={styles.userPhoto} />
      </TouchableOpacity>
      {/* Name Card */}
      <Card style={styles.card}>
        <Card.Content>

          <Text style={styles.cardTitle}>Nom</Text>
          <TextInput
            value={nom}
            onChangeText={handleNameChange}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* Surname Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Prenom</Text>
          <TextInput
            value={prenom}
            onChangeText={handleSurnameChange}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* Email Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>N°Tel</Text>
          <TextInput
            value={tel}
            onChangeText={handleEmailChange}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* Save Button */}
      <Button
        mode="contained"
        style={styles.saveButton}
        labelStyle={styles.buttonLabel}
        onPress={async()=>{await saveUserData()}}
      >
        Save
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  card: {
    width: '30%',
    marginBottom: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    marginBottom: 10,
  },
  saveButton: {
    width: '30%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 16,
  },
});

export default MyAccount;
