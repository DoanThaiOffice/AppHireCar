import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from '@firebase/auth';
import app from '../config/firebaseConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const auth = getAuth(app);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user.email && user.email.toLowerCase() === 'admin@gmail.com') {
        navigation.navigate('Admin');
      } else {
        navigation.navigate('Index');
      }
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        setError('Email không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.code === 'auth/user-not-found') {
        setError('Tài khoản không tồn tại. Vui lòng đăng ký.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Sai mật khẩu. Vui lòng thử lại.');
      } else {
        setError('Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.');
      }
    }
  };

  const handleContact = () => {
    Alert.alert('Liên hệ', 'Số điện thoại liên hệ: 0347011101');
  };

  const handleRetry = () => {
    setError('');
  };

  return (
    <ImageBackground source={require('../assets/bgAppThueXe.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>ĐĂNG NHẬP</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
            <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        {/* Nút Kí gửi xe hoặc Đăng kí tài xế */}
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <Text style={styles.contactButtonText}>Kí gửi xe hoặc Đăng kí tài xế</Text>
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text onPress={() => navigation.navigate('Register')} style={styles.link}>
            Bạn chưa có tài khoản? Đăng kí ngay
          </Text>

          <Text onPress={() => navigation.navigate('ResetPasswordScreen')} style={styles.link}>
            Quên mật khẩu?
          </Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Thử lại" onPress={handleRetry} color="#cc0000" />
          </View>
        ) : null} 
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
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontSize: 36, 
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  showPasswordButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  showPasswordText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Lớp nền mờ để nổi bật văn bản
    padding: 10,
    borderRadius: 10,
  },
  link: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
  errorContainer: {
    backgroundColor: '#ffcccc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#cc0000',
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#00b8cc',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;