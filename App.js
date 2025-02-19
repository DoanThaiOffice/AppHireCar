import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './ScreenUser/LoginScreen';
import RegisterScreen from './ScreenUser/RegisterScreen';
import IndexScreen from './ScreenUser/IndexScreen';
import UserScreen from './ScreenUser/UserScreen';
import CarDetailScreen from './ScreenCarDetail/CarDetailScreen'; // Import màn hình chi tiết xe
import RentedCars from './ScreenCarDetail/RentedCars'; // Import màn hình RentedCars
import Admin from './ScreenAdmin/Admin';
import UserAdmin from './ScreenAdmin/UserAdmin';
import ManageRentedCars from './ScreenAdmin/ManageRentedCars';
import ResetPasswordScreen from './ScreenUser/ResetPasswordScreen';
import DriverAdminScreen from './ScreenAdmin/DriverAdminScreen';
import DriverListScreen from './ScreenUser/DriverListScreen';
import 'react-native-gesture-handler';

const Stack = createStackNavigator();

const App = () => {
  return (
   <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}  // Ẩn tiêu đề cho màn hình "Login"
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}  // Ẩn tiêu đề cho màn hình "Register"
        />
        <Stack.Screen
          name="Index"
          component={IndexScreen}
          options={{ headerShown: false }}  // Ẩn tiêu đề cho màn hình "Index"
        />
        <Stack.Screen
          name="RentedCars"
          component={RentedCars} // Cần cập nhật nếu có màn hình riêng cho "Xe đã thuê"
          options={{ headerShown: false }}  // Ẩn tiêu đề cho màn hình "RentedCars"
        />
        <Stack.Screen
          name="User"
          component={UserScreen}
          options={{ headerShown: false }}  // Ẩn tiêu đề cho màn hình "User"
        />
        <Stack.Screen
          name="CarDetailScreen"
          component={CarDetailScreen} // Màn hình chi tiết xe
          options={{ title: 'Chi tiết xe' }} // Hiện tiêu đề cho màn hình "CarDetail"
        />
        <Stack.Screen
          name="Admin"
          component={Admin} // Màn hình chi tiết xe
          options={{ headerShown: false }}  
        />
        <Stack.Screen
          name="UserAdmin"
          component={UserAdmin}
          options={{ headerShown: false }}  // Ẩn tiêu đề cho màn hình "User"
        />
        <Stack.Screen
          name="ResetPasswordScreen"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}  
        />
        <Stack.Screen 
          name="ManageRentedCars" 
          component={ManageRentedCars} 
          options={{ headerShown: false }}  
        />
        <Stack.Screen 
          name="DriverAdminScreen" 
          component={DriverAdminScreen} 
          options={{ headerShown: false }}  
        />
        <Stack.Screen 
          name="DriverListScreen" 
          component={DriverListScreen} 
          options={{ headerShown: false }}  
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;