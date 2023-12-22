
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
}

export default Home;
