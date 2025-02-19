import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Image } from 'react-native';
import { getAuth, signOut, updatePassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import thư viện icon

const UserAdmin = () => {
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  const handleSaveNewPassword = async () => {
    if (newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        alert('Đổi mật khẩu thành công!');
        setNewPassword('');
        setIsChangingPassword(false);
      } else {
        console.log('User not logged in.');
      }
    } catch (error) {
      console.error('Error updating password:', error.message);
      alert('Có lỗi xảy ra khi đổi mật khẩu.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bgAppThueXe.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quản Lý Người Dùng</Text>
        </View>

        {/* Nội dung chính */}
        <View style={styles.content}>
          {isChangingPassword ? (
            <>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showPasswordText}>
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveNewPassword}>
                <Text style={styles.buttonText}>Lưu Mật Khẩu Mới</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsChangingPassword(false)}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => setIsChangingPassword(true)}>
              <Image source={require('../assets/lock.png')} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Đổi Mật Khẩu</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footer}>
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Admin')}>
                <Ionicons name="home" size={24} color="#fff" />
                <Text style={styles.footerText}>Trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('ManageRentedCars')}>
                <Ionicons name="car" size={24} color="#fff" />
                <Text style={styles.footerText}>QLy Thuê xe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('DriverAdminScreen')}>
                <Ionicons name="people" size={24} color="#fff" />
                <Text style={styles.footerText}>QLy tài xế</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('UserAdmin')}>
                <Ionicons name="person" size={24} color="#fff" />
                <Text style={styles.footerText}>Người dùng</Text>
            </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
  },
  header: {
    backgroundColor: '#4caf50',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  showPasswordText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',    // Căn giữa nội dung theo chiều ngang
    justifyContent: 'center', // Căn giữa biểu tượng và chữ bên trong
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: '#888',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#fff',
    alignItems: 'center',    // Căn giữa nội dung theo chiều ngang
    justifyContent: 'center', // Căn giữa biểu tượng và chữ bên trong
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    width: '90%', // Chiều rộng chiếm 90% màn hình
    alignItems: 'center',    // Căn giữa nội dung theo chiều ngang
    justifyContent: 'center', // Căn giữa biểu tượng và chữ bên trong
    marginTop: 15,
  },  
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 7,
    backgroundColor: '#4caf50',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  footerItem: {
    alignItems: 'center',
    flex: 1,
  },
  footerIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  footerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default UserAdmin;