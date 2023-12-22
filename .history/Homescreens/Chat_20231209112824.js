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
    const isReceiverUser = item.receiver === id_user;
  

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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="always"
      />
      {isTyping && <Text style={styles.typingIndicator}>{`${id_user}current user`}</Text>}
      {isTyping && <Text style={styles.typingIndicator}>{`is typing...`}</Text>}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >

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
const styles = StyleSheet.create({
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
  messageContainer: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    maxWidth: "80%",
  },
  currentUserMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E6E6E6",
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
    marginRight: 8,
  },

  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#6B52AE",
    borderRadius: 25,
    marginRight: 10,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#6B52AE",
    borderRadius: 25,
    marginRight: 10,
  },
  sendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#6B52AE",
    borderRadius: 25,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  typingIndicator: {
    fontStyle: 'italic',
    color: '#6B52AE',
  },
});