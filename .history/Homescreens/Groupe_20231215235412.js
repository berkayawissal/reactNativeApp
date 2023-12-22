// import { View, Text } from 'react-native'
// import React from 'react'

// export default function Groupe() {
//   return (
//     <View>
//       <Text>Groupe</Text>
//     </View>
//   )
// }


// import { View, Text } from 'react-native'
// import React from 'react'

// export default function Groupe() {
//   return (
//     <View>
//       <Text>Groupe</Text>
//     </View>
//   )
// }

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, CheckBox, Image, StyleSheet } from 'react-native';
import firebase from '../Config/Index';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
const Groupe = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const currentid = route.params?.currentid; // Access the currentid parameter from route.params
  const database = firebase.database();
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [users2, setUsers2] = useState([]);
  const [cuurentuserr, setcuurentuserr] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const profilesRef = database.ref('profils');

  useEffect(() => {
    console.log(currentid);
    console.log(currentid);
    profilesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const profiles = Object.values(data);

        // Filter out the profile where uid matches the key
        const filteredProfiles = profiles.filter(profile => profile.uid !== currentid);
        const current = profiles.filter(profile => profile.uid == currentid);
        setcuurentuserr(current);
        setUsers(filteredProfiles);
        setUsers2(profiles);
      }
    });

  }, []);
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    // Fetch user's groups
    const groupsRef = firebase.database().ref('groups');

    groupsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groups = Object.values(data);

        // Filter groups where the current user is a member
        const userGroups = groups.filter(group => group.members && group.members[currentid]);
        setUserGroups(userGroups);
      }
    });

    return () => {
      // Unsubscribe from Firebase listener on component unmount
      groupsRef.off();
    };
  }, [currentid]);
  const handleCreateGroup = () => {
    if (groupName.trim() === '') {
      // Show alert if group name is empty
      alert('Please enter a group name');
      return;
    }
    if (selectedUsers.length < 2) {
      // Show alert if less than 2 users are selected
      alert('Please select at least two users for the group');
      return;
    }
    // Create a new group in Firebase with the provided name and selected users
    const groupsRef = database.ref('groups');
    const newGroupRef = groupsRef.push();
    const groupId = newGroupRef.key;

    const groupData = {
      id: currentid + '_' + Date.now(),
      name: groupName,
      members: {
        [currentid]: true, // Add the current user's ID by default
      },
    };

    selectedUsers.forEach((user) => {
      groupData.members[user.uid] = true;
    });

    newGroupRef
      .set(groupData)
      .then(() => {
        // Group created successfully
        setModalVisible(false);
        setGroupName('');
        setSelectedUsers([]);
      })
      .catch((error) => {
        console.error('Error creating group:', error);
      });
  };




  const renderUserItem = ({ item }) => {
    const isSelected = selectedUsers.find((user) => user.uid === item.uid);

    return (
      <TouchableOpacity onPress={() => handleUserSelect(item)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CheckBox value={isSelected} onValueChange={() => handleUserSelect(item)} />
          <Image source={item.url ? item.url : require('../assets/user.png')} style={styles.profileImage} />
          <Text>{item.nom} {item.prenom}</Text> {/* Display user's name */}
        </View>
      </TouchableOpacity>
    );
  };

  const handleUserSelect = (user) => {
    const index = selectedUsers.findIndex((selectedUser) => selectedUser.uid === user.uid);
    if (index === -1) {
      setSelectedUsers([...selectedUsers, user]);
    } else {
      const updatedSelectedUsers = [...selectedUsers];
      updatedSelectedUsers.splice(index, 1);
      setSelectedUsers(updatedSelectedUsers);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.createGroupButton}>
        <Text style={styles.createGroupText}>Create Group</Text>
      </TouchableOpacity>



      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              value={groupName}
              onChangeText={(text) => setGroupName(text)}
              placeholder="Enter group name"
              style={styles.input}
            />

            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
            />

            <TouchableOpacity onPress={handleCreateGroup} style={styles.actionButton}>
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.actionButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.groupHeaderText}>Groups :</Text>
      <FlatList
       data={userGroups}
       keyExtractor={(item) => item.id.toString()} // Assurez-vous que item.id est unique et convertissez-le en chaîne si nécessaire
       renderItem={({ item }) => (
         <TouchableOpacity style={styles.groupItem} onPress={() => {
           navigation.navigate('ChatGroupe', {
             currentId: currentid,
             id_groupe: item.id,
             nom_groupe: item.name,
           });
         }} >
            <View style={styles.groupItemContent}>
              <View style={styles.groupDetails}>
                <Text style={styles.groupItemText}>{item.name} : </Text>

                {item.members && Object.keys(item.members).map((memberId) => {
                  const memberProfile = users2.find(user => user.uid === memberId);
                  return (
                    <View key={memberId} style={styles.memberItem}>
                      <Image source={memberProfile?.url ? { uri: memberProfile.url } : require('../assets/user.png')} style={styles.memberImage} />
                    </View>
                  );
                })}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />



    </View>
  );
};


const styles = StyleSheet.create({
  groupItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  groupDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberItem: {
    marginRight: 5,
  },
  memberImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  groupItemText: {
    fontSize: 19,
    fontWeight: 'bold',
    marginLeft: 10,
  },


  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  actionButton: {
    backgroundColor: '#',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  createGroupButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  createGroupText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  groupHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  groupItem: {
    padding: 10,
    backgroundColor: '#eee',
    marginBottom: 10,
    borderRadius: 5,
  },
  groupItemText: {
    fontSize: 16,
  },
  profileImage: {
    width: 36, // Reduced width
    height: 36, // Reduced height
    borderRadius: 18, // For a circular image, set borderRadius to half of the width/height
    margin: 8, // Added margin for separation
    // Added margin for separation
  },
});


export default Groupe;


// const styles = StyleSheet.create({
//   groupItemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   groupDetails: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   memberItem: {
//     marginRight: 5,
//   },
//   memberImage: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//   },
//   groupItemText: {
//     fontSize: 19,
//     fontWeight: 'bold',
//     marginLeft: 10,
//   },


//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   input: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   actionButton: {
//     backgroundColor: 'blue',
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   buttonText: {
//     color: 'white',
//     textAlign: 'center',
//   },
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   createGroupButton: {
//     backgroundColor: 'blue',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 20,
//   },
//   createGroupText: {
//     color: 'white',
//     textAlign: 'center',
//     fontSize: 16,
//   },
//   groupHeaderText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   groupItem: {
//     padding: 10,
//     backgroundColor: '#eee',
//     marginBottom: 10,
//     borderRadius: 5,
//   },
//   groupItemText: {
//     fontSize: 16,
//   },
//   profileImage: {
//     width: 36, // Reduced width
//     height: 36, // Reduced height
//     borderRadius: 18, // For a circular image, set borderRadius to half of the width/height
//     margin: 8, // Added margin for separation
//     // Added margin for separation
//   },
// });


// export default Groupe;