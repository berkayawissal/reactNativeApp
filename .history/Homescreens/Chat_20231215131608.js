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
import { Video } from 'expo-av';
import VideoPlayer from 'expo-video-player';
import { ResizeMode } from 'expo-av';

const database = firebase.database();

export default function Chat() {
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
  }, [id_user]);

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
      messagesRef
