import Login from './Components/Login';
import Signup from './Components/Signup';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './Components/Home';
import Chat from './Homescreens/Chat';
import ChatGroupe from './Homescreens/ChatGroupe';
import ResetPassword from './Homescreens/ResetPassword';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="ChatGroupe" component={ChatGroupe} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}