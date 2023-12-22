import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, FlatList, Image, Linking, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';

import firebase from '../Config/Index';
import { useRoute, useNavigation } from '@react-navigation/native';
import { IoChevronBackCircleSharp, IoMdCloseCircleOutline } from "react-icons/io5";
import { BsFiletypeDocx, BsFilePdfFill } from "react-icons/bs";
import { FaCloudUploadAlt, FaLocationArrow } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";
import { MdDelete } from "react-icons/md";
import { format } from 'timeago.js'
import ClipLoader from "react-spinners/ClipLoader";
import InputEmoji from 'react-input-emoji';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir "@expo/vector-icons" dans vos dépendances

import { Video } from 'expo-av';
import VideoPlayer from 'expo-video-player';
import { ResizeMode } from 'expo-av';

const database = firebase.database();

export default function Chat() {
  const defaultAvatar = '../assets/images.jpg';

  const [isTyping, setIsTyping] = useState(false);
  const [reactions, setReactions] = useState({});
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [color, setColor] = useState("#000");
  const [isMuted, setIsMuted] = useState(true);
  const [userAvatar, setUserAvatar] = useState('');
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { currentId, id_user, username, img } = route.params;
  const storage = firebase.storage();

  useEffect(() => {
    const fetchUserAvatar = async (userId) => {
      try {
        const snapshot = await firebase.database().ref(`profils/${userId}`).once('value');
        const userData = snapshot.val();
        if (userData && userData.url) {
          setUserAvatar(userData.url);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserAvatar(id_user);
  }, []);

  const returnToList = () => {
    navigation.goBack();
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
      messagesArray.sort((a, b) => a.time - b.time);
      setMessages(messagesArray);
      setReactions(reactionsObj);
    });

    return () => {
      messageRef.off('value');
    };
  }, [currentId, id_user]);

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

        const splitData = result.assets[0].uri.split(';');

        if (splitData.length > 0) {
          var imageFormat = splitData[0].split('/')[1];
          if (imageFormat === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
            imageFormat = 'docx';
          }

          const uploadedImageUrl = await uploadImageToFirebase(result.assets[0].uri, imageFormat);

          const currentTime = new Date().toISOString();
          const ref_msg = database.ref('msgS');
          const key = ref_msg.push().key;
          ref_msg
            .child(key)
            .set({
              msg: uploadedImageUrl,
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

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      const currentTime = new Date().toISOString();
      const ref_msg = database.ref("msgS");
      const key = ref_msg.push().key;
      ref_msg.child(key).set({
        msg: googleMapsUrl,
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

  const handleDropMessage = (messageId) => {
    const confirmDrop = window.confirm('Are you sure you want to drop this message?');

    if (confirmDrop) {
      const messagesRef = database.ref('msgS');
      messagesRef        .child(messageId)
      .remove()
      .then(() => {
        console.log('Message dropped successfully');
      })
      .catch((error) => {
        console.error('Error dropping message:', error);
      });
  }
};

const uploadImageToFirebase = async (uri, imageFormat) => {
  try {
    const blob = await imageToBlob(uri);
    const currentTime = new Date().getTime();
    const imagePath = `images/${currentId}_${currentTime}.${imageFormat}`;

    const ref = storage.ref().child(imagePath);

    await ref.put(blob);

    const url = await ref.getDownloadURL();
    return url;
  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    throw error;
  }
};

const renderMessageItem = ({ item }) => {
  const isCurrentUser = item.sender === currentId;
  const reactionCount = Object.keys(reactions[item.id] || {}).length;

  return (
    <View style={styles.messageContainer}>
      <View style={[styles.messageBubble, { backgroundColor: isCurrentUser ? '#DCF8C5' : '#fff' }]}>
        {item.msg.startsWith('https://www.google.com/maps/') ? (
          <TouchableOpacity onPress={() => Linking.openURL(item.msg)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <SiGooglemaps size={24} color="#4CAF50" />
              <Text style={{ marginLeft: 5, color: '#4CAF50' }}>Location</Text>
            </View>
          </TouchableOpacity>
        ) : item.msg.endsWith('.pdf') ? (
          <TouchableOpacity onPress={() => Linking.openURL(item.msg)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <BsFilePdfFill size={24} color="#F44336" />
              <Text style={{ marginLeft: 5, color: '#F44336' }}>PDF</Text>
            </View>
          </TouchableOpacity>
        ) : item.msg.endsWith('.docx') ? (
          <TouchableOpacity onPress={() => Linking.openURL(item.msg)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <BsFiletypeDocx size={24} color="#2196F3" />
              <Text style={{ marginLeft: 5, color: '#2196F3' }}>DOCX</Text>
            </View>
          </TouchableOpacity>
        ) : item.msg.startsWith('https://firebasestorage.googleapis.com/') ? (
          <TouchableOpacity onPress={() => Linking.openURL(item.msg)}>
            <Image source={{ uri: item.msg }} style={styles.imageMessage} resizeMode="cover" />
          </TouchableOpacity>
        ) : item.msg.startsWith('https://www.youtube.com/') ? (
          <VideoPlayer
            videoProps={{
              shouldPlay: false,
              resizeMode: Video.RESIZE_MODE_COVER,
              source: {
                uri: item.msg,
              },
            }}
            isMuted={isMuted}
            showControlsOnLoad={true}
            style={{ height: 200 }}
          />
        ) : (
          <Text style={{ color: isCurrentUser ? '#000' : '#333' }}>{item.msg}</Text>
        )}
      </View>
      <View style={styles.messageInfo}>
        <Text style={styles.messageTime}>{format(item.time)}</Text>
        <TouchableOpacity
          onPress={() => {
            setSelectedMessageId(item.id);
            setColor('#3498db');
          }}
          onLongPress={() => handleDropMessage(item.id)}
        >
          <MdDelete size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const renderReactions = () => {
  if (!selectedMessageId) return null;

  const handleReaction = (emoji) => {
    const messageRef = database.ref(`msgS/${selectedMessageId}/reactions`);
    messageRef.transaction((reactions) => {
      if (!reactions) {
        reactions = {};
      }
      if (reactions[emoji]) {
        reactions[emoji] += 1;
      } else {
        reactions[emoji] = 1;
      }
      return reactions;
    });

 
  };

  return (
    <View style={styles.reactionsContainer}>
      {['❤️', '👍', '😂', '😢', '😡'].map((emoji) => (
        <TouchableOpacity
          key={emoji}
          style={[styles.reactionButton, { backgroundColor: color }]}
          onPress={() => handleReaction(emoji)}
        >
          <Text style={styles.reactionText}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const scrollToBottom = () => {
  if (flatListRef.current) {
    flatListRef.current.scrollToEnd();
  }
};

const flatListRef = useRef();

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
            <View style={styles.reactionContainer}>
        <TouchableOpacity onPress={() => handleReaction(item.id, 'thumbs-up')}>
          <Text>{`👍 ${reactions[item.id]?.['thumbs-up'] || 0}`}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleReaction(item.id, 'thumbs-down')}>
          <Text>{`👎 ${reactions[item.id]?.['thumbs-down'] || 0}`}</Text>
        </TouchableOpacity>
        {/* Ajoutez d'autres réactions au besoin */}
      </View>
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
                <Text style={{ color: 'black' }}>{format(item.time)}</Text>
              </View>





            </View>
          )}

          <View>
            {!isCurrentUser && (
              <View>




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
      <View style={styles.header}>
        <TouchableOpacity onPress={returnToList}>
          <IoChevronBackCircleSharp size={30} color="#3498db" />
        </TouchableOpacity>
        <Image source={{ uri: userAvatar || defaultAvatar }} style={styles.avatar} />
        <Text style={styles.username}>{username}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        style={styles.messageList}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}  // Assurez-vous que chaque élément a une clé unique
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ClipLoader size={50} color="#3498db" loading={isLoading} />
        </View>
      )}
      {renderReactions()}
      <InputEmoji
        value={msg}
        onChange={(text) => setMsg(text)}
        onSend={() => {
          const currentTime = new Date().toISOString();
          const ref_msg = database.ref('msgS');
          const key = ref_msg.push().key;
          ref_msg
            .child(key)
            .set({
              msg: msg,
              id: currentId + '_' + id_user + '_' + currentTime,
              sender: currentId,
              receiver: id_user,
              time: currentTime,
              status: false,
              droped: false,
            })
            .then(() => setMsg(''))
            .catch((error) => console.error('Error sending message:', error));
        }}
        placeholder="Type a message"
        cleanOnSend
      />
   
  </View>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#ecf0f1',
},
keyboardAvoidingView: {
  flex: 1,
},
header: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 15,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#ecf1',
},
avatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginLeft: 10,
},
username: {
  marginLeft: 10,
  fontSize: 18,
  fontWeight: 'bold',
},
messageList: {
  flex: 1,
  padding: 10,
},
messageContainer: {
  flexDirection: 'row',
  marginBottom: 10,
  maxWidth: '80%',
  alignSelf: 'flex-start',
},
messageBubble: {
  padding: 10,
  borderRadius: 8,
  maxWidth: '80%',
  overflow: 'hidden',
},
messageInfo: {
  marginLeft: 5,
  alignItems: 'flex-end',
  justifyContent: 'space-between',
},
messageTime: {
  fontSize: 12,
  color: '#777',
},
imageMessage: {
  width: 200,
  height: 200,
  borderRadius: 8,
  marginTop: 5,
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
reactionText: {
  fontSize: 16,
},
loadingContainer: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.7)',
},
});


