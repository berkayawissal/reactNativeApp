import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TextInput, Modal, CheckBox, TouchableOpacity, FlatList, Image, Linking, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { FaSignOutAlt } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";

import firebase from '../Config/Index';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import useNavigation
import { IoChevronBackCircleSharp } from "react-icons/io5";
import * as ImagePicker from "expo-image-picker";
import VideoPlayer from 'expo-video-player'
import { ResizeMode } from 'expo-av'
import { Video } from 'expo-av';
import { BsFiletypeDocx } from "react-icons/bs";
import { BsFilePdfFill } from "react-icons/bs";
import { IoMdCloseCircleOutline } from "react-icons/io";
import InputEmoji from 'react-input-emoji'
import { FaCloudUploadAlt } from "react-icons/fa";
import * as Location from 'expo-location';
import { FaLocationArrow } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";
import { MdDelete } from "react-icons/md";
import { format } from 'timeago.js'

import ClipLoader from "react-spinners/ClipLoader";


const database = firebase.database();

export default function ChatGroupe() {
    const [isTyping, setIsTyping] = useState(false);
    let [color, setColor] = useState("#000");
    const [isMuted, setIsMuted] = useState(true); // State to store mute status
    const [users, setUsers] = useState([]);

    const handleMuteToggle = () => {
        setIsMuted((prevState) => !prevState); // Toggle mute status
    };
    const navigation = useNavigation(); // Get navigation object
    const storage = firebase.storage();

    const route = useRoute();
    const { currentId, id_groupe, nom_groupe } = route.params;
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentgroupe, setcurrentgroupe] = useState([]);
    const [scrollY, setScrollY] = useState(0); // State to store scroll position

    // Function to handle clicks on the media
    const handleMediaClick = (media, y) => {
        setSelectedMedia(media);
        setScrollY(y); // Store the scroll position when the media is clicked
    };
    const profilesRef = database.ref('profils');
    const [notusers, setnotUsers] = useState([]);

    const addToGroup = async (groupID, userID) => {
        try {
            const groupsRef = firebase.database().ref('groups');

            groupsRef.once('value', (snapshot) => {
                const groups = snapshot.val();
                if (groups) {
                    // Find the group with the matching groupID
                    const groupToAdd = Object.entries(groups).find(([key, group]) => group.id === groupID);

                    if (groupToAdd) {
                        const [groupKey, groupData] = groupToAdd;
                        const groupMembersRef = firebase.database().ref(`groups/${groupKey}/members`);
                        groupMembersRef.update({ [userID]: true });
                        console.log(`User ${userID} added to group ${groupID} successfully.`);
                    } else {
                        console.error("Group not found.");
                    }
                } else {
                    console.error("No groups found.");
                }
            });
        } catch (error) {
            console.error("Error adding user to group:", error);
        }
    };


    useEffect(() => {
        const groupsRef = firebase.database().ref('groups');

        groupsRef.once('value', (snapshot) => {
            const groups = snapshot.val();
            if (groups) {
                // Find the group with the matching groupID
                const groupToRemove = Object.entries(groups).find(
                    ([key, group]) => group.id === id_groupe
                );

                if (groupToRemove) {
                    const [groupKey, groupData] = groupToRemove;
                    setcurrentgroupe(groupData);

                    profilesRef.once('value', (snapshot) => {
                        const data = snapshot.val();
                        if (data) {
                            const profiles = Object.values(data);

                            // Filter out the profile where uid matches the key
                            const filteredProfiles = profiles.filter(
                                (profile) => profile.uid !== currentId
                            );

                            // Filter non-group members from the fetched profiles
                            const nonGroupMembers = filteredProfiles.filter(
                                (profile) => !Object.keys(groupData.members).includes(profile.uid)
                            );

                            setnotUsers(nonGroupMembers);
                            console.log(nonGroupMembers);
                        }
                    });
                } else {
                    console.error('Group not found.');
                }
            } else {
                console.error('No groups found.');
            }
        });
    }, []);
    const [visible, setVisible] = useState(false);

    const [selectedUsers, setSelectedUsers] = useState([]); // State to hold selected users' IDs
    const handleAddToGroup = () => {
        // Logic to add selected users to the group
        // Call the addToGroup function for each selected user
        selectedUsers.forEach(userID => addToGroup(id_groupe, userID));
        setVisible(false)

        // Close the modal
    };
    const handleSelectUser = (userID) => {
        // Toggle selection of the user
        const updatedSelectedUsers = selectedUsers.includes(userID)
            ? selectedUsers.filter(id => id !== userID)
            : [...selectedUsers, userID];
        setSelectedUsers(updatedSelectedUsers);
    };
    const returnToList = () => {
        navigation.goBack(); // Navigate back to the list screen
    };
    const handleTyping = (isFocused) => {
        const currentUserTypingRef = database.ref(`conversation/${currentId}_${id_groupe}/isTyping`);
        currentUserTypingRef.set(isFocused);

        const otherUserTypingRef = database.ref(`conversation/${id_groupe}_${currentId}/isTyping`);
        otherUserTypingRef.on('value', (snapshot) => {
            const otherUserIsTyping = snapshot.val();
            setIsTyping(otherUserIsTyping);
        });
    };

    useEffect(() => {
        const messageRef = database.ref('msgSGroupe').orderByChild('time');

        messageRef.on('value', (snapshot) => {
            const messagesArray = [];
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                if (
                    (message.id_groupe === id_groupe)
                ) {
                    messagesArray.push({ ...message, id: childSnapshot.key });
                }
            });
            // Sort messages by time or any other relevant criterion
            messagesArray.sort((a, b) => a.time - b.time);
            setMessages(messagesArray);
        });

        // Clean up the listener when the component unmounts
        return () => {
            messageRef.off('value');
        };
    }, [currentId]);
    const [isLoading, setIsLoading] = useState(false);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.cancelled) {
                setIsLoading(true);

                console.log(result.assets[0].uri);
                const splitData = result.assets[0].uri.split(';');

                // Extract the image format (extension) from the first part after splitting
                if (splitData.length > 0) {
                    var imageFormat = splitData[0].split('/')[1];
                    if (imageFormat === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
                        imageFormat = 'docx';
                    }
                    console.log('Image format:', imageFormat); // This will log 'jpeg' in this case

                    const uploadedImageUrl = await uploadImageToFirebase(result.assets[0].uri, imageFormat);
                    // Use the uploadedImageUrl as needed in your app
                    console.log('Uploaded Image URL:', uploadedImageUrl);

                    // Send the image URL to the chat
                    const currentTime = new Date().toISOString();
                    const ref_msg = database.ref('msgSGroupe');
                    const key = ref_msg.push().key;
                    ref_msg
                        .child(key)
                        .set({
                            msg: uploadedImageUrl, // Save the image URL in the message
                            id: currentId + "_" + id_groupe + "_" + currentTime,
                            id_groupe: id_groupe,
                            sender: currentId,
                            time: currentTime,
                            status: false,
                            droped: false,
                        })
                        .then(() => {
                            setIsLoading(false); // Set loading state to false after successful upload and message creation
                        })
                        .catch((error) => {
                            console.error('Error sending message:', error);
                            setIsLoading(false); // Set loading state back to false in case of an error
                        });
                } else {
                    console.error('Invalid image data');
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false); // Set loading state to false when the user cancels image selection
            }
        } catch (error) {
            console.error('Error picking image:', error);
            setIsLoading(false); // Set loading state back to false in case of an error
        }
    };


    // The rest of your code remains unchanged...

    const sendCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Construct the Google Maps URL
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

            // Here, you can send the Google Maps URL as part of your message
            const currentTime = new Date().toISOString();
            const ref_msg = database.ref("msgSGroupe");
            const key = ref_msg.push().key;
            ref_msg.child(key).set({
                msg: googleMapsUrl, // Send the Google Maps URL in the message
                id: currentId + "_" + id_groupe + "_" + currentTime,
                id_groupe: id_groupe,
                sender: currentId,
                time: currentTime,
                status: false,
                droped: false,
            });
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };
    // Function to convert image URI to blob
    const imageToBlob = async (uri) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });
    };
    const [selectedMedia, setSelectedMedia] = useState(null);

    const removeFromGroup = async (groupID, userID) => {
        try {
            const groupsRef = firebase.database().ref('groups');

            groupsRef.once('value', (snapshot) => {
                const groups = snapshot.val();
                if (groups) {
                    // Find the group with the matching groupID
                    const groupToRemove = Object.entries(groups).find(([key, group]) => group.id === groupID);

                    if (groupToRemove) {
                        const [groupKey, groupData] = groupToRemove;
                        const groupMembersRef = firebase.database().ref(`groups/${groupKey}/members/${userID}`);
                        groupMembersRef.remove();
                        console.log(`User ${userID} removed from group ${groupID} successfully.`);
                    } else {
                        console.error("Group not found.");
                    }
                } else {
                    console.error("No groups found.");
                }
            });
        } catch (error) {
            console.error("Error removing user from group:", error);
        }
    };


    // Call this function when the user wants to leave the group


    const handleLeaveGroup = async () => {
        const confirmLeave = window.confirm('Are you sure you want to Leave this groupe ?');
        if (confirmLeave) {
            await removeFromGroup(id_groupe, currentId);
            navigation.goBack(); // Navigate back to the list screen

        }

    };





    const openGoogleMapsLink = (url) => {
        Linking.openURL(url);
    };
    // Function to upload image blob to Firebase Storage
    const uploadImageToFirebase = async (imageUri, extension) => {
        try {
            const blob = await imageToBlob(imageUri);
            const timestamp = Date.now();

            // Upload blob to Firebase Storage
            const storageRef = firebase.storage().ref();
            const imageRef = storageRef.child(`msgSGroupe/${currentId}_${id_groupe}_${timestamp}.${extension}`);
            const snapshot = await imageRef.put(blob);

            // Get the download URL of the uploaded image
            const downloadURL = await snapshot.ref.getDownloadURL();

            return downloadURL;
        } catch (error) {
            console.error('Error uploading image to Firebase:', error);
            throw error;
        }
    };

    const handleDropMessage = (messageId) => {
        // Prompt the user to confirm before dropping the message
        const confirmDrop = window.confirm('Are you sure you want to drop this message?');

        if (confirmDrop) {
            // Find the message with the specified ID in the database
            const messagesRef = database.ref('msgSGroupe');
            messagesRef.orderByChild('id').equalTo(messageId).once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const messageKey = childSnapshot.key;
                    // Update the status of the message to mark it as unsent
                    database.ref(`msgSGroupe/${messageKey}`).update({
                        msg: 'unsent',
                        droped: true,
                    })
                        .then(() => {
                            console.log(`Message with ID ${messageId} marked as unsent`);
                            const messageRef = database.ref('msgSGroupe').orderByChild('time');

                            messageRef.on('value', (snapshot) => {
                                const messagesArray = [];
                                snapshot.forEach((childSnapshot) => {
                                    const message = childSnapshot.val();
                                    if (
                                        (message.id_groupe === id_groupe)
                                    ) {
                                        messagesArray.push({ ...message, id: childSnapshot.key });
                                    }
                                });
                                // Sort messages by time or any other relevant criterion
                                messagesArray.sort((a, b) => a.time - b.time);
                                setMessages(messagesArray);
                            });


                        })
                        .catch((error) => {
                            console.error('Error updating message status:', error);
                        });
                });
            });
        } else {
            console.log('Message drop canceled by user');
            // You might want to handle what happens if the user cancels dropping the message here
        }
    };

    const inputRef = useRef(null);

    // Function to focus and scroll to the input
    const scrollToInput = () => {
        if (inputRef.current) {
            inputRef.current.focus(); // Focus on the input field
        }
    };

    useEffect(() => {
        scrollToInput(); // Call the function after rendering to focus on the input field
    }, []);

    const sendMessage = () => {
        const currentTime = new Date().toISOString();
        const ref_msg = database.ref("msgSGroupe");
        const key = ref_msg.push().key;
        ref_msg.child(key).set({



            id: currentId + "_" + id_groupe + "_" + currentTime,
            msg: msg,
            id_groupe: id_groupe,
            sender: currentId,
            time: currentTime,
            status: false,
            droped: false,
        });
        setMsg('');
    };
    const handleCloseButtonClick = () => {
        setSelectedMedia(null);
    };
    const renderMessage = ({ item, index }) => {
        const sender = users.find(user => user.uid === item.sender);
        const userAvatar = sender ? sender.url : null;
        const usernom = sender ? sender.nom : null;
        const isCurrentUser = item.sender === currentId;
        const isGoogleMapsLink = item.msg && item.msg.includes('google.com/maps');

        const isImage = item.msg && item.msg.startsWith('http') && (item.msg.includes('.jpg') || item.msg.includes('.jpeg') || item.msg.includes('.png'));
        const isVideo = item.msg && item.msg.startsWith('http') && (item.msg.includes('.mp4') || item.msg.includes('.mov') || item.msg.includes('.avi'));
        const isPDF = item.msg && item.msg.startsWith('http') && (item.msg.includes('.pdf'));
        const isDOCX = item.msg && item.msg.startsWith('http') && (item.msg.includes('.docx') || item.msg.includes('officedocument'));
        if (isImage) {
            return (
                <View>
                    {isCurrentUser && (
                        <View>

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <View style={[styles.messageContainer, styles.currentUserMessage2]}>
                                    {item.droped === false && (
                                        <TouchableOpacity onPress={() => handleDropMessage(`${item.sender}_${item.id_groupe}_${item.time}`)}>
                                            <Text style={{ marginRight: 5, alignSelf: 'center', position: 'relative', top: 5 }}>
                                                <MdDelete size={22} style={{ color: 'red' }} />
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={[styles.messageContainer, styles.currentUserimg]}>
                                    <TouchableOpacity onPress={(e) => handleMediaClick(item.msg, e.nativeEvent.pageY)}>
                                        <Image source={{ uri: item.msg }} style={styles.imageMessage} />
                                    </TouchableOpacity>
                                </View>
                            </View>


                            <View style={[styles.messageContainer2, styles.currentUserimg, { paddingRight: 0 }]}>
                                <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                            </View>
                        </View>
                    )}

                    <View>
                        {!isCurrentUser && (



                            <View>




                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                    <View style={[styles.messageContainer, styles.otherUseimg, { paddingBottom: 0, }]}>
                                        <Image source={userAvatar ? userAvatar : require('../assets/user.png')} style={styles.avatar} /> {/* User's avatar */}

                                    </View>

                                    <View style={[styles.messageContainer, styles.otherUserimg]}>

                                        <TouchableOpacity onPress={(e) => handleMediaClick(item.msg, e.nativeEvent.pageY)}>
                                            <Image source={{ uri: item.msg }} style={styles.imageMessage} />
                                        </TouchableOpacity>
                                    </View>  </View>



                                <View style={[styles.messageContainer2, styles.otherUserimg, {
                                    paddingTop: 0,
                                    position: 'relative',
                                    left: 55, top: 6
                                }]}>
                                    <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                                </View>


                            </View>








                        )}
                    </View>
                </View>
            );

        } else if (isVideo) {
            return (
                <View>
                    {isCurrentUser && (
                        <View>

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <View style={[styles.messageContainer, styles.currentUserMessage2]}>
                                    {item.droped === false && (
                                        <TouchableOpacity onPress={() => handleDropMessage(`${item.sender}_${item.id_groupe}_${item.time}`)}>
                                            <Text style={{ marginRight: 5, alignSelf: 'center', position: 'relative', top: 5 }}>
                                                <MdDelete size={22} style={{ color: 'red' }} />
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={[styles.messageContainer, styles.currentUserimg]}>
                                    <TouchableOpacity onPress={(e) => handleMediaClick(item.msg, e.nativeEvent.pageY)}>
                                        <VideoPlayer
                                            videoProps={{
                                                shouldPlay: false,
                                                source: {
                                                    uri: item.msg,
                                                },
                                            }}
                                            style={{ width: 200, height: 200 }}
                                            videoBackground='transparent'
                                            resizeMode={ResizeMode.CONTAIN}
                                            mute={{
                                                enterMute: () => setIsMuted(true),
                                                exitMute: () => setIsMuted(false),
                                                isMute: isMuted,
                                                visible: true,
                                            }}
                                        />                </TouchableOpacity>

                                </View>
                            </View>

                            <View style={[styles.messageContainer2, styles.currentUserimg, { paddingRight: 0 }]}>
                                <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                            </View>
                        </View>
                    )}

                    <View>
                        {!isCurrentUser && (






                            <View>




                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                    <View style={[styles.messageContainer, styles.otherUserimg, { paddingBottom: 0, }]}>
                                        <Image source={userAvatar ? userAvatar : require('../assets/user.png')} style={styles.avatar} /> {/* User's avatar */}

                                    </View>

                                    <View style={[styles.messageContainer, styles.otherUserimg]}>

                                        <TouchableOpacity onPress={(e) => handleMediaClick(item.msg, e.nativeEvent.pageY)}>
                                            <VideoPlayer
                                                videoProps={{
                                                    shouldPlay: false,
                                                    source: {
                                                        uri: item.msg,
                                                    },
                                                }}
                                                style={{ width: 200, height: 200 }}
                                                videoBackground='transparent'
                                                resizeMode={ResizeMode.CONTAIN}
                                                mute={{
                                                    enterMute: () => setIsMuted(true),
                                                    exitMute: () => setIsMuted(false),
                                                    isMute: isMuted,
                                                    visible: true,
                                                }}
                                            />                </TouchableOpacity>
                                    </View>  </View>



                                <View style={[styles.messageContainer2, styles.otherUserimg, {
                                    paddingTop: 0,
                                    position: 'relative',
                                    left: 55, top: 6
                                }]}>
                                    <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                                </View>


                            </View>









                        )}
                    </View>
                </View>
            );

        } else if (isPDF || isDOCX) {

            const fileType = isPDF ? 'pdf' : 'docx';
            const FileIcon = isPDF ? BsFilePdfFill : BsFiletypeDocx;

            const handleFileDownload = () => {
                Linking.openURL(item.msg);
            };

            return (
                <View>
                    {isCurrentUser && (
                        <View>

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <View style={[styles.messageContainer, styles.currentUserMessage2]}>
                                    {item.droped === false && (
                                        <TouchableOpacity onPress={() => handleDropMessage(`${item.sender}_${item.id_groupe}_${item.time}`)}>
                                            <Text style={{ marginRight: 5, alignSelf: 'center', position: 'relative', top: 5 }}>
                                                <MdDelete size={22} style={{ color: 'red' }} />
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={[styles.messageContainer, styles.currentUserMessage]}>
                                    <TouchableOpacity onPress={handleFileDownload}>
                                        <Text style={{ color: 'white' }}>
                                            {FileIcon && <FileIcon />}
                                            {` Download ${fileType.toUpperCase()}`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[styles.messageContainer2, styles.currentUserimg, { paddingRight: 0 }]}>
                                <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                            </View>
                        </View>
                    )}

                    {!isCurrentUser && (



                        <View>




                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                <View style={[styles.messageContainer, styles.currentUserMessage2, { paddingBottom: 0, }]}>
                                    <Image source={userAvatar ? userAvatar : require('../assets/user.png')} style={styles.avatar} /> {/* User's avatar */}

                                </View>

                                <View style={[styles.messageContainer, styles.otherUserMessage]}>

                                    <TouchableOpacity onPress={handleFileDownload}>
                                        <Text style={{ color: 'black' }}>
                                            {FileIcon && <FileIcon />}
                                            {` Download ${fileType.toUpperCase()}`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>  </View>



                            <View style={[styles.messageContainer2, styles.otherUserimg, {
                                paddingTop: 0,
                                position: 'relative',
                                left: 55, top: 6
                            }]}>
                                <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                            </View>


                        </View>

                    )}
                </View>
            );

        } else if (isGoogleMapsLink) {
            return (
                <View>
                    {isCurrentUser && (
                        <View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <View style={[styles.messageContainer, styles.currentUserMessage2]}>
                                    {item.droped === false && (
                                        <TouchableOpacity onPress={() => handleDropMessage(`${item.sender}_${item.id_groupe}_${item.time}`)}>
                                            <Text style={{ marginRight: 5, alignSelf: 'center', position: 'relative', top: 5 }}>
                                                <MdDelete size={22} style={{ color: 'red' }} />
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={[styles.messageContainer, styles.currentUserMessage]}>
                                    <TouchableOpacity onPress={() => openGoogleMapsLink(item.msg)}>
                                        <View style={{ alignItems: 'center' }}>
                                            <SiGooglemaps size={30} />
                                            <Text style={{ color: 'white' }}>Open Google Maps</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[styles.messageContainer2, styles.currentUserimg, { paddingRight: 0 }]}>
                                <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                            </View>
                        </View>
                    )}

                    {!isCurrentUser && (


                        <View>




                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                <View style={[styles.messageContainer, styles.currentUserMessage2, { paddingBottom: 0, }]}>
                                    <Image source={userAvatar ? userAvatar : require('../assets/user.png')} style={styles.avatar} /> {/* User's avatar */}

                                </View>

                                <View style={[styles.messageContainer, styles.otherUserMessage]}>

                                    <TouchableOpacity onPress={() => openGoogleMapsLink(item.msg)}>
                                        <View style={{ alignItems: 'center' }}>
                                            <SiGooglemaps size={30} />
                                            <Text style={{ color: 'black' }}>Open Google Maps</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>  </View>



                            <View style={[styles.messageContainer2, styles.otherUserimg, {
                                paddingTop: 0,
                                position: 'relative',
                                left: 55, top: 10
                            }]}>
                                <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                            </View>












                        </View>)}






                </View>
            );
        }

        else {
            return (
                <View>
                    {isCurrentUser && (
                        <View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <View style={[styles.messageContainer, styles.currentUserMessage2]}>
                                    {item.droped === false && (
                                        <TouchableOpacity onPress={() => handleDropMessage(`${item.sender}_${item.id_groupe}_${item.time}`)}>
                                            <Text style={{ marginRight: 5, alignSelf: 'center', position: 'relative', top: 5 }}>
                                                <MdDelete size={22} style={{ color: 'red' }} />
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>



                                <View style={[styles.messageContainer, styles.currentUserMessage]}>

                                    <Text style={{ color: 'black' }}>{item.msg}</Text>
                                </View>
                            </View>

                            <View style={[styles.messageContainer2, styles.currentUserimg, { paddingRight: 0 }]}>
                                <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                            </View>





                        </View>
                    )}

                    <View>
                        {!isCurrentUser && (
                            <View>


                                <Text style={[styles.messageContainer, styles.currentUserMessage3, { fontSize: 13 }]}>{usernom}</Text>

                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                    <View style={[styles.messageContainer, styles.currentUserMessage2, { paddingBottom: 0, }]}>
                                        <Image source={userAvatar ? userAvatar : require('../assets/user.png')} style={styles.avatar} /> {/* User's avatar */}

                                    </View>

                                    <View style={[styles.messageContainer, styles.otherUserMessage]}>

                                        <Text style={{ color: 'black' }}>{item.msg}</Text>
                                    </View>  </View>



                                <View style={[styles.messageContainer2, styles.otherUserimg, {
                                    paddingTop: 0,
                                    position: 'relative',
                                    left: 55
                                }]}>
                                    <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                                </View>












                            </View>

                        )}
                    </View>
                </View>);

        }
    };




    return (

        <View style={styles.container}>
            <View >

                <TouchableOpacity
                    style={[styles.returnButton, { marginBottom: 8, padding: 7 }]}
                    onPress={returnToList}
                >
                    <IoChevronBackCircleSharp size={30} />
                </TouchableOpacity>
                <Text style={{
                    marginRight: 40,
                    alignSelf: 'center',
                    alignContent: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 40,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>{nom_groupe}</Text>
            </View>
            <FlatList

                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}

            />
            <View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

                >
                    {isTyping && <View style={[styles.messageContainer, styles.otherUserMessage]}>
                        <Text style={styles.typingIndicator}>{`is typing...`}</Text>         </View>
                    }
                </KeyboardAvoidingView>
            </View>
            {/* Display selected media */}
            {selectedMedia && (

                <View style={[styles.overlay, { top: scrollY }]}>

                    {/* Show selected image or video */}
                    {selectedMedia.includes('.mp4') || selectedMedia.includes('.mov') || selectedMedia.includes('.avi') ? (
                        <View><TouchableOpacity onPress={handleCloseButtonClick} style={styles.closeButton}>
                            <IoMdCloseCircleOutline size={25} />
                        </TouchableOpacity>
                            <VideoPlayer
                                videoProps={{
                                    shouldPlay: true,
                                    source: {
                                        uri: item.msg,
                                    },
                                }}
                                style={styles.selectedMedia} videoBackground='transparent'
                                resizeMode={ResizeMode.CONTAIN}
                            />


                        </View>

                    ) : (

                        <View><TouchableOpacity onPress={handleCloseButtonClick} style={styles.closeButton}>
                            <IoMdCloseCircleOutline size={25} />
                        </TouchableOpacity>

                            <Image source={{ uri: selectedMedia }} style={styles.selectedMedia} />



                        </View>

                    )}

                    {/* Close button */}

                </View>

            )}
            {isLoading && (
                <View style={styles.currentUserupload}>
                    <ClipLoader
                        color={color}
                        loading={isLoading}
                        size={50}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </View>
            )}
            <View style={styles.inputContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                        style={{ marginRight: 10 }}
                        onPress={returnToList}
                    >
                        <IoChevronBackCircleSharp size={25} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setVisible(true)} style={{ marginRight: 10 }}>
                        <IoIosAddCircle size={25} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLeaveGroup} style={{ marginRight: 10 }}>
                        {/* Add your icon or button for leaving the group here */}
                        {/* For example, you can use an icon like "Leave Group" */}
                        <FaSignOutAlt size={22} />

                    </TouchableOpacity>

                    <TouchableOpacity onPress={sendCurrentLocation} style={{ marginRight: 10 }}>
                        <FaLocationArrow size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={pickImage}>
                        {/* Add your icon or button for picking images or videos here */}
                        {/* For example, you can use an icon from a library like Feather */}
                        <FaCloudUploadAlt size={22} />
                    </TouchableOpacity>
                </View>




                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={visible}
                    onRequestClose={() => setVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text>Choose users to add to the group:</Text>

                            {notusers.map(user => (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <CheckBox
                                        value={selectedUsers.includes(user.uid)}
                                        onValueChange={() => handleSelectUser(user.uid)}
                                    />
                                    <Image source={user.url ? user.url : require('../assets/user.png')} style={styles.profileImage} />
                                    <Text>{user.nom} {user.prenom}</Text>
                                </View>


                            ))}


                            <TouchableOpacity onPress={handleAddToGroup} style={styles.actionButton}>
                                <Text style={styles.buttonText}>Add to Group</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setVisible(false)} style={styles.actionButton}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>













                <InputEmoji
                    ref={inputRef}
                    cleanOnEnter
                    onFocus={() => handleTyping(true)}
                    onBlur={() => handleTyping(false)}
                    placeholder="Type a message"
                    value={msg}
                    onChange={setMsg}
                />

                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>

            </View>

        </View>















    );

}
const styles = StyleSheet.create({

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
        backgroundColor: '#D2B5FA',
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
        backgroundColor: '#7D4A86',
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
    typingIndicator: {
        fontStyle: 'italic',
        color: '#6B52AE',
    },
    closeButton: {
        position: 'absolute',
        top: -52,
        right: -11,
        color: 'white',
        padding: 10,
        borderRadius: 5,
        zIndex: 999,
    },
    selectedMedia: {
        width: 500,
        height: 500,
        resizeMode: 'cover',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#BC6FCA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageMessage: {
        width: 200,
        height: 200,
        resizeMode: 'cover',
        borderRadius: 14,
    },
    hidden: {
        display: 'none', // Not a valid style property in React Native
        // You can use other styles like this to hide the component
        width: 0,
        height: 0,
        opacity: 0,
        // Or set the visibility to 'hidden'
        visibility: 'hidden',
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 15,
    },
    messageContainer2: {
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        maxWidth: "80%",
    },
    messageContainer: {
        padding: 10,
        marginBottom: -5,
        borderRadius: 8,
        maxWidth: "80%",
    },
    videoPlayerContainer: {
        width: 250, // Define your desired width
        height: 200, // Define your desired height
        borderRadius: 14,
        aspectRatio: 16 / 9, // Set the aspect ratio of the video

    },
    currentUserimg: {
        alignSelf: "flex-end",

    },
    currentUserMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#D2B5FA",
        color: "#fff"
    }, currentUserMessage2: {
        alignSelf: "center",

    },
    currentUserMessage3: {
        alignSelf: "flex-start",

    },
    currentUserupload: {
        alignSelf: "flex-end",
        backgroundColor: "#fff"
    },
    otherUserimg: {
        alignSelf: "flex-start",
    },
    otherUserMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#7D4A86",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        paddingVertical: 10,
    }, avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 2,
        position: 'relative',
        bottom: 11
    },
    inputField: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        marginRight: 10,
    },
    sendButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: "#007BFF",
        borderRadius: 20,
    },
    sendButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

// Styles remain unchanged
