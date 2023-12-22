import { View, Text } from 'react-native'

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, TextInput } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeBlog = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello!',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);
  }, []);

  const onSend = (newMessages = []) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
  };

  const pickImage = () => {
    ImagePicker.showImagePicker((response) => {
      if (response.uri) {
        const imageMessage = {
          _id: Math.round(Math.random() * 1000000),
          image: response.uri,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        };
        onSend([imageMessage]);
      }
    });
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#2ecc71',
          },
          left: {
            backgroundColor: '#ecf0f1',
          },
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <TouchableOpacity onPress={() => onSend(props.currentMessage)}>
        <View style={{ marginRight: 10, marginBottom: 5 }}>
          <Icon name="send" size={30} color="#2ecc71" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderActions = () => {
    return (
      <TouchableOpacity onPress={pickImage}>
        <View style={{ marginRight: 10, marginBottom: 5 }}>
          <Icon name="camera" size={30} color="#3498db" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => onSend(newMessages)}
      user={{
        _id: 1,
      }}
      renderBubble={renderBubble}
      renderSend={renderSend}
      renderActions={renderActions}
    />
  );
};

export default HomeBlog;
