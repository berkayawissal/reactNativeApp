import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import useNavigation
import firebase from '../Config/Index';

const database = firebase.database();

export default function Chat() {
  const route = useRoute();
  const navigation = useNavigation(); // Initialize navigation
  const { currentId, id_user } = route.params;
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const messageRef = database.ref('msgS').orderByChild('time');
    messageRef.on('child_added', (snapshot) => {
      const newMessage = snapshot.val();
      setMessages((prevMessages) => [...prevMessages, { ...newMessage, id: snapshot.key }]);
    });

    return () => {
      messageRef.off('child_added');
    };
  }, []);

  const sendMessage = () => {
    const currentTime = new Date().toISOString();
    const ref_msg = database.ref('msgS');
    const key = ref_msg.push().key;
    ref_msg.child(key).set({
      msg: msg,
      sender: currentId,
      receiver: id_user,
      time: currentTime,
      status: false,
    });
    setMsg('');
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

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender === currentId;

    return (
      <View
        style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}
      >
        <Text>{item.msg}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="always"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        {isTyping && <Text style={styles.typingIndicator}>{`${currentId} current user`}</Text>}
        {isTyping && <Text style={styles.typingIndicator}>{`${id_user} is typing...`}</Text>}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TextInput
          value={msg}
          onChangeText={(text) => setMsg(text)}
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
          placeholder="Type your message here"
          style={styles.inputField}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}