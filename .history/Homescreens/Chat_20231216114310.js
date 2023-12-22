import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, FlatList, Image, Linking, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';
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
// import { transparent } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { transparent } from 'react-native-paper';

const database = firebase.database();

export default function Chat() {
  const [reactions, setReactions] = useState({});
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const [isTyping, setIsTyping] = useState(false);
  let [color, setColor] = useState("#000");
  const [isMuted, setIsMuted] = useState(true); // State to store mute status
  const handleMuteToggle = () => {
    setIsMuted((prevState) => !prevState); // Toggle mute status
  };
  const navigation = useNavigation(); // Get navigation object
  const storage = firebase.storage();

  const route = useRoute();
  const { currentId, id_user, username, img } = route.params;
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [scrollY, setScrollY] = useState(0); // State to store scroll position
  const [reactionsCount, setReactionsCount] = useState(0);

  const handleReaction = (messageId, reaction) => {
    // Update the reactions state with the selected reaction for the specific message
    setReactions((prevReactions) => ({
      ...prevReactions,
      [messageId]: reaction,
    }));
    setReactionsCount((prevCount) => prevCount + 1);

    // Update the reactions in the database (assuming you have a messages collection)
    const messageRef = database.ref(`messages/${messageId}/reactions`);
    messageRef.transaction((reactions) => {
      if (!reactions) {
        reactions = {};
      }
      if (reactions[reaction]) {
        reactions[reaction] += 1;
      } else {
        reactions[reaction] = 1;
      }
      return reactions;
    });
  };

  // Function to handle clicks on the media
  const handleMediaClick = (media, y) => {
    setSelectedMedia(media);
    setScrollY(y); // Store the scroll position when the media is clicked
  };

  const [userAvatar, setUserAvatar] = useState('');

  useEffect(() => {
    // Function to fetch user data by ID from Firebase
    const fetchUserAvatar = async (userId) => {
      try {
        const snapshot = await firebase.database().ref(`profils/${userId}`).once('value');
        const userData = snapshot.val();

        // Extract and decode the Base64 image string
        if (userData && userData.url) {
          setUserAvatar(userData.url);
          console.log(userData.url)
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Call the function with the user ID
    fetchUserAvatar(id_user);
  }, []);


  const returnToList = () => {
    navigation.goBack(); // Navigate back to the list screen
  };
  const handleTyping = (isFocused) => {
    const currentUserTypingRef = database.ref(`conversation/${currentId}_${id_user}/isTyping`);
    currentUserTypingRef.set(isFocused);

    const otherUserTypingRef = database.ref(`conversation/${id_user}_${currentId}/isTyping`);
    otherUserTypingRef.on('value', (snapshot) => {
      const otherUserIsTyping = snapshot.val();
      setIsTyping(otherUserIsTyping);
    });
  };

  useEffect(() => {
    const messageRef = database.ref('msgS').orderByChild('time');

    messageRef.on('value', (snapshot) => {
      const messagesArray = [];
      const reactionsObj = {};
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        if (
          (message.sender === currentId && message.receiver === id_user) ||
          (message.sender === id_user && message.receiver === currentId)
        ) {
          messagesArray.push({ ...message, id: childSnapshot.key });
          reactionsObj[childSnapshot.key] = message.reactions || {};
        }
      });
      // Sort messages by time or any other relevant criterion
      messagesArray.sort((a, b) => a.time - b.time);
      setMessages(messagesArray);
      setReactions(reactionsObj);
    });

    // Clean up the listener when the component unmounts
    return () => {
      messageRef.off('value');
    };
  }, [currentId, id_user]);
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
          const ref_msg = database.ref('msgS');
          const key = ref_msg.push().key;
          ref_msg
            .child(key)
            .set({
              msg: uploadedImageUrl, // Save the image URL in the message
              id: currentId + '_' + id_user + '_' + currentTime,
              sender: currentId,
              receiver: id_user,
              time: currentTime,
              status: false,
              droped: false,
            })
            .then(() => {
              setIsLoading(false);
            })
            .catch((error) => {
              console.error('Error sending message:', error);
              setIsLoading(false);
            });
        } else {
          console.error('Invalid image data');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setIsLoading(false);
    }
  };

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
      const ref_msg = database.ref("msgS");
      const key = ref_msg.push().key;
      ref_msg.child(key).set({
        msg: googleMapsUrl, // Send the Google Maps URL in the message
        id: currentId + "_" + id_user + "_" + currentTime,
        sender: currentId,
        receiver: id_user,
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
      const imageRef = storageRef.child(`msgs/${currentId}_${id_user}_${timestamp}.${extension}`);
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
    const confirmDrop = window.confirm('Vous étes sûr de supprimer ce message ?');

    if (confirmDrop) {
      // Find the message with the specified ID in the database
      const messagesRef = database.ref('msgS');
      messagesRef.orderByChild('id').equalTo(messageId).once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const messageKey = childSnapshot.key;
          // Update the status of the message to mark it as unsent
          database.ref(`msgS/${messageKey}`).update({
            msg: 'Message Deleted',
            droped: true,
          })
            .then(() => {
              console.log(`Message with ID ${messageId} marked as unsent`);
              const messageRef = database.ref('msgS').orderByChild('time');

              messageRef.on('value', (snapshot) => {
                const messagesArray = [];
                snapshot.forEach((childSnapshot) => {
                  const message = childSnapshot.val();
                  if (
                    (message.sender === currentId && message.receiver === id_user) ||
                    (message.sender === id_user && message.receiver === currentId)
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
    const ref_msg = database.ref("msgS");
    const key = ref_msg.push().key;
    ref_msg.child(key).set({
      id: currentId + "_" + id_user + "_" + currentTime,
      msg: msg,
      sender: currentId,
      receiver: id_user,
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
                    <TouchableOpacity onPress={() => handleDropMessage(`${item.sender}_${item.receiver}_${item.time}`)}>
                      <Text style={{ marginRight: 5, alignSelf: 'center', position: 'relative', top: 5 }}>
                        <MdDelete size={22} style={{ color: 'red' }} />
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => setSelectedMessageId(item.id)}>
                    <Text>{item.text}</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.messageContainer, styles.currentUserimg]}>
                  <TouchableOpacity onPress={(e) => handleMediaClick(item.msg, e.nativeEvent.pageY)}>
                    <Image source={{ uri: item.msg }} style={styles.imageMessage} />
                  </TouchableOpacity>
                </View>
              </View>


              <View style={[styles.messageContainer2, styles.currentUserimg, { paddingRight: 0 }]}>
                <View style={styles.reactionsContainer}>
                  {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionButton, { backgroundColor: "#FECDFD" }]}
                      onPress={() => handleReaction(emoji)}
                    >
                      <Text style={styles.reactionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ color: 'black' }}>{format(item.time)}</Text>
                {/* <Text style={{ marginLeft: 10, color: 'black' }}>{reactionsCount}</Text> */}


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
                  <View style={styles.reactionsContainer}>
                    {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[styles.reactionButton, { backgroundColor: "#FECDFD" }]}
                        onPress={() => handleReaction(emoji)}
                      >
                        <Text style={styles.reactionText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
                    <TouchableOpacity onPress={() => handleDropMessage(`${item.sender}_${item.receiver}_${item.time}`)}>
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
                <View style={styles.reactionsContainer}>
                  {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionButton, { backgroundColor: "#FECDFD" }]}
                      onPress={() => handleReaction(emoji)}
                    >
                      <Text style={styles.reactionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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

                      />
                    </TouchableOpacity>
                  </View>  </View>
                <View style={[styles.messageContainer2, styles.otherUserimg, {
                  paddingTop: 0,
                  position: 'relative',
                  left: 55, top: 6
                }]}>
                  <View style={styles.reactionsContainer}>
                    {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[styles.reactionButton, { backgroundColor: "#FECDFD" }]}
                        onPress={() => handleReaction(emoji)}
                      >
                        <Text style={styles.reactionText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
                    <TouchableOpacity onPress={() => handleDropMessage(`${item.sender}_${item.receiver}_${item.time}`)}>
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
                <View style={styles.reactionsContainer}>
                  {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionButton, { backgroundColor: "#FECDFD" }]}
                      onPress={() => handleReaction(emoji)}
                    >
                      <Text style={styles.reactionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                <View style={styles.reactionsContainer}>
                  {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionButton, { backgroundColor: "#FECDFD" }]}
                      onPress={() => handleReaction(emoji)}
                    >
                      <Text style={styles.reactionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                    <TouchableOpacity onPress={() => handleDropMessage(`${item.sender}_${item.receiver}_${item.time}`)}>
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
                <View style={styles.reactionsContainer}>
                  {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionButton, { backgroundColor: "#FECDFD" }]}
                      onPress={() => handleReaction(emoji)}
                    >
                      <Text style={styles.reactionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                </View>
              </View>
              <View style={[styles.messageContainer2, styles.otherUserimg, {
                paddingTop: 0,
                position: 'relative',
                left: 55, top: 10
              }]}>
                <View style={styles.reactionsContainer}>
                  {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionButton, { backgroundColor: "#FECDFD" }]}
                      onPress={() => handleReaction(emoji)}
                    >
                      <Text style={styles.reactionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                    <TouchableOpacity onPress={() => handleDropMessage(`${item.sender}_${item.receiver}_${item.time}`)}>
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
                <View style={styles.reactionsContainer}>
                  {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionButton, { backgroundColor: "#FECDFD" }]}
                      onPress={() => handleReaction(emoji)}
                    >
                      <Text style={styles.reactionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ color: 'black' }}>{format(item.time)}</Text>
              </View>
            </View>
          )}

          <View>
            {!isCurrentUser && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                  <View style={[styles.messageContainer, styles.currentUserMessage2, { paddingBottom: 0 }]}>
                    <Image source={userAvatar ? userAvatar : require('../assets/user.png')} style={styles.avatar} />
                  </View>

                  <View style={[styles.messageContainer, styles.otherUserMessage]}>
                    <Text style={{ color: 'black' }}>{item.msg}</Text>
                  </View>
                </View>

                <View style={[styles.messageContainer2, styles.otherUserimg, { paddingTop: 0, position: 'relative', left: 55 }]}>
                  {/* Ajoutez ici la section pour les réactions */}
                  <View style={styles.reactionsContainer}>
                    {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[styles.reactionButton, { backgroundColor: "#FECDFD" }]}
                        onPress={() => handleReaction(emoji)}
                      >
                        <Text style={styles.reactionText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity onPress={() => setSelectedMessageId(item.id)}>
                    <Text>{item.text}</Text>
                  </TouchableOpacity>
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


        <Image source={img ? img : require('../assets/user.png')} style={{
          marginRight: 40,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10,
          width: 100,
          height: 100,
          borderRadius: 50,
        }} />

        <Text style={{
          marginRight: 40,
          alignSelf: 'center',
          alignContent: 'center',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 40,
          fontSize: 22,
          fontWeight: 'bold',
        }}>{username}</Text>
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
          <TouchableOpacity onPress={sendCurrentLocation} style={{ marginRight: 10 }}>
            <FaLocationArrow size={20} />
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage}>
            {/* Add your icon or button for picking images or videos here */}
            {/* For example, you can use an icon from a library like Feather */}
            <FaCloudUploadAlt size={22} />
          </TouchableOpacity>
        </View>
        {rea()}
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
  typingIndicator: {
    fontStyle: 'italic',
    color: transparent,
  },
  closeButton: {
    position: 'absolute',
    top: -52,
    right: -11,
    color: '#BC6FCA',
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
    backgroundColor: "#471B58",
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  otherUseimg: {
    marginRight: 8,
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
    backgroundColor: '#ecf0f1',
    borderTopWidth: 1,
    borderTopColor: '#bdc3c7',
  },
  reactionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});

// Styles remain unchanged
