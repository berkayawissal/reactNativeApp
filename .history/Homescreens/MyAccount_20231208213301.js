import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Button, TextInput, Card } from 'react-native-paper';
import * as ImagePicker from "expo-image-picker";
import firebase from '../Config/Index';
import { TouchableOpacity } from 'react-native-web';
import { useRoute } from '@react-navigation/native';

const database=firebase.database();
const MyAccount = (props) => {
  const route = useRoute();
  const currentid = route.params?.currentid; // Access the currentid parameter from route.params
  const [userDetails, setUserDetails] = useState({
    nom: '',
    prenom: '',
    tel: '',
    url: '',
    uid:"",
  });
  const [Isdefault, setIsdefault] = useState(true);
  const [urlImage, seturlImage] = useState('');

  useEffect(() => {
    const profileRef = database.ref(`
    Profils/${currentid}`);
    setUserDetails({ ...userDetails, uid: currentid });

    profileRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        const profileData = snapshot.val();
        setUserDetails({ ...profileData, uid: currentid });
        setIsdefault(true);
        console.log(profileData)

      }
    })}
  
  , []);
  

  const handleNameChange = (text) => {
    setUserDetails({ ...userDetails, nom: text });
  };

  const handleSurnameChange = (text) => {
    setUserDetails({ ...userDetails, prenom: text });
  };

  const handleEmailChange = (text) => {
    setUserDetails({ ...userDetails, tel: text });
  };

  const saveUserData = async () => {
  
      await database.ref(`profils/${currentid}`).set(userDetails);
      console.log('User details updated successfully!');
    
  };
 

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      setIsdefault(false);
      seturlImage(result.assets[0].uri);
      setUserDetails({ ...userDetails, url: result.assets[0].uri });

    }
  };
  const imageToBlob = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob"; //bufferArray
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    return blob;
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
      <Image source={Isdefault?userDetails.url?userDetails.url:require('./../assets/user.png'):{uri:urlImage}} style={styles.userPhoto} />
      </TouchableOpacity>
      {/* Name Card */}
      <Card style={styles.card}>
        <Card.Content>

          <Text style={styles.cardTitle}>Nom</Text>
          <TextInput
            value={userDetails.nom}
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
            value={userDetails.prenom}
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
            value={userDetails.tel}
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
