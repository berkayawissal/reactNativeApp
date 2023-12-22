
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import List_Profile from "../Homescreens/List_Profile";
import MyAccount from "../Homescreens/MyAccount";
import Groupe from "../Components/Homescreens/Homescreens/Groupe";
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
