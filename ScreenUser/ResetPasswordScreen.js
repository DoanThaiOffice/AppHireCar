import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ImageBackground, Alert } from 'react-native';
import { getAuth, sendPasswordResetEmail } from '@firebase/auth';
import app from '../config/firebaseConfig';

const ResetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    const auth = getAuth(app);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Một email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.');
      setError('');
    } catch (error) {
      console.error('Error resetting password:', error.message);
      if (error.code === 'auth/invalid-email') {
        Alert.alert('Email không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('Email không tồn tại. Vui lòng đăng ký.');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
      setMessage('');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bgAppThueXe.jpg')} // Đường dẫn tới ảnh nền
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>ĐẶT LẠI MẬT KHẨU</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập email của bạn"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <Button title="Gửi Yêu Cầu" onPress={handleResetPassword} />
        {message ? <Text style={styles.successMessage}>{message}</Text> : null}
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        <Text onPress={() => navigation.navigate('Login')} style={styles.link}>
          Quay lại trang đăng nhập
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
  successMessage: {
    marginTop: 20,
    color: '#004d00', // Sử dụng màu xanh đậm hơn để dễ đọc hơn
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Thêm nền trắng để nổi bật trên ảnh nền
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 8,
  },
  errorMessage: {
    marginTop: 20,
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ResetPasswordScreen;