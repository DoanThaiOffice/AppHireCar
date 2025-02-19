import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ImageBackground,Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from '@firebase/auth';
import { collection, addDoc } from '@firebase/firestore';
import app, { db } from '../config/firebaseConfig';  // Import Firebase config và Firestore instance

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    const auth = getAuth(app);
    try {
      // Đăng ký người dùng với email và mật khẩu
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Lưu thông tin người dùng vào Firestore
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        username: username,
        phoneNumber: phoneNumber,
        email: email,
        password: password,
        address: address,
      });

      Alert.alert('Đăng kí tài khoản thành công!');
      navigation.navigate('Login');  // Điều hướng đến màn hình đăng nhập sau khi đăng ký thành công
    } catch (error) {
      Alert.alert("Vui lòng nhập lại thông tin đăng kí")
      console.error('Registration error:', error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bgAppThueXe.jpg')} // Đường dẫn tới ảnh nền (background)
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>ĐĂNG KÝ TÀI KHOẢN</Text>
        <TextInput
          style={styles.input}
          placeholder="Họ và Tên"
          value={username}
          onChangeText={setUsername}
        />
        {/* <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ"
          value={address}
          onChangeText={setAddress}
        /> */}
        <TextInput
          style={styles.input}
          placeholder="Email đăng nhập"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Đăng kí" onPress={handleRegister} />
        <Text onPress={() => navigation.navigate('Login')} style={styles.link}>
          Bạn đã có tài khoản? Đăng nhập ngay !
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#FFFFFF',
    borderWidth: 3,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 16,
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    marginTop: 20,
    color: '#880000',
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;