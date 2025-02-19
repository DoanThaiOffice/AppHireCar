import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,ImageBackground, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import thư viện icon

const ManageRentedCars = () => {
  const [rentedCars, setRentedCars] = useState([]);
  const navigation = useNavigation();

  // Lấy danh sách tất cả giao dịch thuê xe từ Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'RentedCars'), (snapshot) => {
      const rentedData = snapshot.docs.map((doc) => ({
        idThueXe: doc.id,
        ...doc.data(),
      }));
      setRentedCars(rentedData);
    });

    return unsubscribe; 
  }, []);

  // Hàm xóa một giao dịch thuê xe
  const handleDeleteRent = async (rentId) => {
    Alert.alert(
      'Xóa giao dịch thuê',
      'Bạn có chắc chắn muốn xóa giao dịch này không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              const rentDocRef = doc(db, 'RentedCars', rentId);
              await deleteDoc(rentDocRef);
              Alert.alert('Thành công', 'Giao dịch thuê đã được xóa.');
            } catch (error) {
              console.error('Lỗi khi xóa giao dịch thuê:', error.message);
              Alert.alert('Lỗi', 'Không thể xóa giao dịch thuê.');
            }
          },
        },
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../assets/bgAppThueXe.jpg')}
      style={styles.background}
    >
        <View style={styles.container}>
            <View style={styles.header}>
            <Text style={styles.headerTitle}>Danh sách xe đã thuê</Text>
            </View>
            {rentedCars.length > 0 ? (
                <FlatList
                data={rentedCars}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                    <Text style={styles.cardText}>Tên xe: {item.name}</Text>
                    <Text style={styles.cardText}>Người thuê: {item.username}</Text>
                    <Text style={styles.cardText}>Số điện thoại: {item.phoneNumber}</Text>
                    <Text style={styles.cardText}>Ngày thuê: {new Date(item.rentDate).toLocaleDateString()}</Text>
                    <Text style={styles.cardText}>Ngày trả: {new Date(item.returnDate).toLocaleDateString()}</Text>
                    <Text style={styles.cardText}>Tổng tiền: {item.totalPrice.toLocaleString('vi-VN')} VND</Text>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteRent(item.idThueXe)}
                    >
                        <Text style={styles.deleteButtonText}>Xóa</Text>
                    </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item) => item.idThueXe}
                />
            ) : (
                <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có xe nào được thuê.</Text>
                </View>
            )}

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
    resizeMode: 'cover' 
  },
  container: { 
    flex: 1,
    justifyContent: 'space-between', // Chia đều không gian giữa nội dung và footer
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 30,
    color: '#555',
    backgroundColor: '#ccc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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

export default ManageRentedCars;