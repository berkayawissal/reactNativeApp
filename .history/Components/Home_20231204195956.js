
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import List_Profile from "../Components/Homescreens/List_Profile";
import MyAccount from "../Components/Homescreens/MyAccount";
import Groupe from "./Components/Homescreens/Groupe";
const Tab = createMaterialBottomTabNavigator();

const Home = (props) => {
    
  
    return (
      <Tab.Navigator>
        <Tab.Screen name="listprofile"  component={List_Profile} />
        <Tab.Screen name="groupe" component={Groupe} />
        <Tab.Screen name="myaccount" component={MyAccount} />
      </Tab.Navigator>
    );
  };


export default Home;
