import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { getAuth, signOut, updatePassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { db } from '../config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const UserScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Trạng thái hiển thị mật khẩu
  const [originalData, setOriginalData] = useState({}); // Lưu dữ liệu gốc để có thể hủy

  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true); // Bắt đầu tải
      try {
        const user = auth.currentUser;
        if (user) {
          console.log('Đang lấy dữ liệu cho UID:', user.uid); // Kiểm tra UID của người dùng
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log('Dữ liệu người dùng:', userData); // Log dữ liệu người dùng
  
            // Sử dụng dấu ngoặc vuông để lấy dữ liệu các trường có ký tự đặc biệt
            setUsername(userData.username || ''); 
            setEmail(userData['email'] || ''); // Truy cập 'e-mail' thay vì email
            setPhoneNumber(userData.phoneNumber || '');
            setAddress(userData.address || '');
            setOriginalData(userData); // Lưu dữ liệu gốc
          } else {
            console.log('Không có tài liệu này!');
          }
        } else {
          console.log('Không có người dùng nào đang đăng nhập.');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error.message);
      } finally {
        setLoading(false); // Kết thúc tải
      }
    };
  
    fetchUserData();
  }, []);

  //Cập nhật thông tin người dùng
  const handleSaveChanges = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Không tìm thấy người dùng!');
        return;
      }
  
      const docRef = doc(db, 'users', auth.currentUser.uid);
      console.log("Cập nhật tài liệu cho UID:", user.uid);
  
      // Cập nhật dữ liệu trong Firestore
      await setDoc(
        docRef,
        {
          username,
          email,
          phoneNumber,
          address,
        },
        { merge: true } // Chỉ cập nhật các trường đã có
      );
      Alert.alert('Thông tin đã được cập nhật!');
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error.message);
      Alert.alert('Có lỗi xảy ra khi lưu thay đổi.');
    }
  };
  

  const handleCancel = () => {
    // Hoàn tác thay đổi
    setUsername(originalData.username);
    setEmail(originalData['email']);
    setPhoneNumber(originalData.phoneNumber);
    setAddress(originalData.address);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Đăng xuất thành công!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error.message);
    }
  };

  const handleSaveNewPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        Alert.alert('Đổi mật khẩu thành công!');
        setNewPassword('');
        setIsChangingPassword(false);
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error.message);
      Alert.alert('Có lỗi xảy ra khi đổi mật khẩu.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bgAppThueXe.jpg')}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Thông Tin Người Dùng</Text>
        </View>

        <Image source={require('../assets/user.png')} style={styles.avatar} />

        {loading ? (
          <ActivityIndicator size="large" color="#f0a500" />
        ) : isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Tên người dùng"
            />
            {/* <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
            /> */}
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Số điện thoại"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Địa chỉ"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
              <Text style={styles.buttonText}>Lưu Thay Đổi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.infoText}>Tên: {username}</Text>
            {/* <Text style={styles.infoText}>Email: {email}</Text> */}
            <Text style={styles.infoText}>Số điện thoại: {phoneNumber}</Text>
            <Text style={styles.infoText}>Địa chỉ: {address}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>Chỉnh Sửa Thông Tin</Text>
            </TouchableOpacity>
          </>
        )}

        {isChangingPassword ? (
          <>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showPassword} // Toggle visibility based on state
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordButton}
              >
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
          <TouchableOpacity style={styles.changePasswordButton} onPress={() => setIsChangingPassword(true)}>
            <Text style={styles.changePasswordButtonText}>Đổi Mật Khẩu</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Index')}>
                <Image source={require('../assets/home.png')} style={styles.footerIcon} />
                <Text>Trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('RentedCars')}>
                <Image source={require('../assets/carlogo.jpg')} style={styles.footerIcon} />
                <Text>Xe đã thuê</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('DriverListScreen')}>
                <Image source={require('../assets/carDriver.jpg')} style={styles.footerIconCar} />
                <Text>Thuê tài xế</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('User')}>
                <Image source={require('../assets/user.png')} style={styles.footerIcon} />
                <Text>Người dùng</Text>
            </TouchableOpacity>
        </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f0a500',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  editButton: {
    backgroundColor: '#f0a500',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 15,
    top: 10,
  },
  showPasswordText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  changePasswordButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  changePasswordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#888',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#cc0000',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerIcon: {
    width: 24,
    height: 24,
    marginBottom: 5,
  },
  footerIconCar: {
    width: 50,
    height: 24,
    marginBottom: 5,
  },
});

export default UserScreen;