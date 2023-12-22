import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import List_Profile from "../Homescreens/List_Profile";
import MyAccount from "../Homescreens/MyAccount";
import Groupe from "../Homescreens/Groupe";
import { useRoute } from '@react-navigation/native';
import React from 'react';
import HomeBlog from "../Homescreens/HomeBlog";
import Icon from 'react-native-vector-icons/FontAwesome';

const Tab = createMaterialBottomTabNavigator();

const Home = ({ navigation }) => {
  const route = useRoute();
  const { currentid } = route.params;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ tabBarVisible: true }}
      backBehavior="initialRoute"
    >
      <Tab.Screen
        name="Home"
        component={HomeBlog}
        initialParams={{ currentid: currentid }}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Icon name="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="listprofile"
        initialRouteName="listprofile"
        screenOptions={{ tabBarVisible: true }}
        backBehavior="initialRoute"
        component={List_Profile}
        initialParams={{ currentid: currentid }}
        options={{
          tabBarLabel: 'List Profile',
          tabBarIcon: ({ color }) => (
            <Icon name="users" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="groupe"
        component={Groupe}
        initialParams={{ currentid: currentid }}
        options={{
          tabBarLabel: 'Groupe',
          tabBarIcon: ({ color }) => (
            <Icon name="group" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="myaccount"
        component={MyAccount}
        initialParams={{ currentid: currentid }}
        options={{
          tabBarLabel: 'My Account',
          tabBarIcon: ({ color }) => (
            <Icon name="user" color={color} size={26} />
          ),
        }}
      />
       <Tab.Screen
        name="setting"
        component={Settings}
        initialParams={{ currentid: currentid }}
        options={{
          tabBarLabel: 'Groupe',
          tabBarIcon: ({ color }) => (
            <Icon name="group" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Home;
