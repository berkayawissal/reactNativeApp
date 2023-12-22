
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import List_Profile from "../Homescreens/List_Profile";
import MyAccount from "../Homescreens/MyAccount";
import Groupe from "../Homescreens/Groupe";
import { useRoute } from '@react-navigation/native';
import React from 'react';

const Tab = createMaterialBottomTabNavigator();

const Home = ({ navigation }) => {
  const route = useRoute();
  const { currentid } = route.params;

  return (
    <Tab.Navigator
      initialRouteName="listprofile"
      screenOptions={{ tabBarVisible: true }}
      backBehavior="initialRoute"
    >
      <Tab.Screen
        name="listprofile"
        component={List_Profile}
        initialParams={{ currentid : currentid}}
        options={{
          tabBarLabel: 'List Profile',
        }}
      />
      <Tab.Screen
        name="groupe"
        component={Groupe}
        options={{
          tabBarLabel: 'Groupe',
        }}
      />
      <Tab.Screen
        name="myaccount"
        component={MyAccount}
        initialParams={{ currentid}}

        options={{
          tabBarLabel: 'My Account',
        }}
      />
    </Tab.Navigator>
  );
};

export default Home;
