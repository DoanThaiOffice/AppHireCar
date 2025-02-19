import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, Button, ImageBackground,Alert } from 'react-native';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from '@firebase/firestore';
import { db } from '../config/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const DriverAdminScreen = () => {
  const navigation = useNavigation(); 
  const [modalVisible, setModalVisible] = useState(false); // Trạng thái mở/đóng modal
  const [isEditing, setIsEditing] = useState(false); 
  const [editingDriverId, setEditingDriverId] = useState(null); // ID tài xế đang chỉnh sửa
  const [drivers, setDrivers] = useState([]); 
  const [filteredDrivers, setFilteredDrivers] = useState([]); // Danh sách tài xế đã lọc
  const [searchText, setSearchText] = useState(''); // Nội dung tìm kiếm
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    address: '',
    salary: '',
    daysWorked: '',
  });

  // Lắng nghe thay đổi từ Firestore và cập nhật danh sách tài xế
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'drivers'), (snapshot) => {
      const driversData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDrivers(driversData); // Cập nhật danh sách tài xế
      setFilteredDrivers(driversData); // Cập nhật danh sách đã lọc
    });
    return unsubscribe;
  }, []);

  // Xử lý tìm kiếm tài xế
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = drivers.filter((driver) =>
      driver.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredDrivers(filtered); // Cập nhật danh sách sau khi tìm kiếm
  };

  // Mở modal chỉnh sửa với dữ liệu tài xế
  const openEditModal = (driver) => {
    setNewDriver(driver); // Điền dữ liệu vào form
    setEditingDriverId(driver.id); // Lưu ID tài xế chỉnh sửa
    setIsEditing(true); // Kích hoạt chế độ chỉnh sửa
    setModalVisible(true); // Mở modal
  };

  // Thêm tài xế mới vào Firestore
  const handleAddDriver = async () => {
    try {
      // Kiểm tra các trường dữ liệu đã điền đầy đủ
      if (!newDriver.name || !newDriver.phone || !newDriver.address || !newDriver.salary || !newDriver.daysWorked) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
      }

      // Lưu tài xế mới vào Firestore
      await addDoc(collection(db, 'drivers'), {
        ...newDriver,
        salary: parseInt(newDriver.salary), // Chuyển lương thành số
        daysWorked: parseInt(newDriver.daysWorked || 0), // Chuyển số ngày làm việc thành số
      });

      Alert.alert('Thêm tài xế thành công!');
      setModalVisible(false); // Đóng modal
      resetForm(); // Reset form
    } catch (error) {
      Alert.alert('Có lỗi xảy ra khi thêm tài xế.');
    }
  };

  // Sửa thông tin tài xế trong Firestore
  const handleEditDriver = async () => {
    try {
      const driverDocRef = doc(db, 'drivers', editingDriverId); // Lấy tài liệu tài xế
      await updateDoc(driverDocRef, {
        ...newDriver,
        salary: parseInt(newDriver.salary), // Chuyển lương thành số
        daysWorked: parseInt(newDriver.daysWorked || 0), // Chuyển số ngày làm việc thành số
      });

      alert('Cập nhật tài xế thành công!');
      setModalVisible(false); // Đóng modal
      setIsEditing(false); // Thoát chế độ chỉnh sửa
      setEditingDriverId(null); // Xóa ID tài xế chỉnh sửa
      resetForm(); // Reset form
    } catch (error) {
      console.error('Lỗi khi chỉnh sửa tài xế:', error.message);
    }
  };

  // Xóa tài xế khỏi Firestore
  const handleDeleteDriver = async (driverId) => {
    try {
      const driverDocRef = doc(db, 'drivers', driverId); 
      await deleteDoc(driverDocRef); 
      Alert.alert('Xóa tài xế thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa tài xế:', error.message);
    }
  };

  // Reset dữ liệu form
  const resetForm = () => {
    setNewDriver({
      name: '',
      phone: '',
      address: '',
      salary: '',
      daysWorked: '',
    });
  };

  // Tính tổng lương tất cả tài xế
  const calculateTotalSalary = () => {
    return drivers.reduce((total, driver) => {
      return total + (driver.salary * (driver.daysWorked || 0)); // Tổng lương = lương cơ bản * số ngày làm việc
    }, 0);
  };

  // Render từng tài xế trong danh sách
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDetails}>SĐT: {item.phone}</Text>
        <Text style={styles.cardDetails}>Địa chỉ: {item.address}</Text>
        <Text style={styles.cardDetails}>Lương cơ bản: {item.salary.toLocaleString()} VND</Text>
        <Text style={styles.cardDetails}>Số ngày làm việc: {item.daysWorked || 0}</Text>
        <Text style={styles.cardDetails}>
          Tổng lương: {(item.salary * (item.daysWorked || 0)).toLocaleString()} VND
        </Text>
        <View style={styles.actionButtons}>
          {/* Nút chỉnh sửa */}
          <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
            <Text style={styles.editText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          {/* Nút xóa */}
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteDriver(item.id)}>
            <Text style={styles.deleteText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../assets/bgAppThueXe.jpg')} style={styles.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quản Trị Tài Xế</Text>
        </View>

        {/* Thanh tìm kiếm */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tài xế"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        {/* Nút thêm tài xế */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Thêm tài xế</Text>
        </TouchableOpacity>

        {/* Danh sách tài xế */}
        <FlatList
          data={filteredDrivers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />

        {/* Tổng lương tất cả tài xế */}
        <View style={styles.totalSalaryContainer}>
          <Text style={styles.totalSalaryText}>
            Tổng lương tất cả nhân viên: {calculateTotalSalary().toLocaleString()} VND
          </Text>
        </View>

        {/* Modal thêm/chỉnh sửa tài xế */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{isEditing ? 'Chỉnh sửa tài xế' : 'Thêm tài xế mới'}</Text>
              {/* Form nhập liệu */}
              <TextInput
                style={styles.input}
                placeholder="Tên"
                value={newDriver.name}
                onChangeText={(text) => setNewDriver({ ...newDriver, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                value={newDriver.phone}
                onChangeText={(text) => setNewDriver({ ...newDriver, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ"
                value={newDriver.address}
                onChangeText={(text) => setNewDriver({ ...newDriver, address: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Lương cơ bản (VND)"
                value={newDriver.salary}
                onChangeText={(text) => setNewDriver({ ...newDriver, salary: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Số ngày làm việc"
                value={newDriver.daysWorked}
                onChangeText={(text) => setNewDriver({ ...newDriver, daysWorked: text })}
                keyboardType="numeric"
              />
              <View style={styles.modalButtons}>
                <Button title="Hủy" onPress={() => setModalVisible(false)} color="#888" />
                {isEditing ? (
                  <Button title="Sửa" onPress={handleEditDriver} color="#4caf50" />
                ) : (
                  <Button title="Thêm" onPress={handleAddDriver} color="#4caf50" />
                )}
              </View>
            </View>
          </View>
        </Modal>

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
  searchBar: { 
    flexDirection: 'row', 
    margin: 15, 
    padding: 10, 
    backgroundColor: '#f1f1f1', 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#ccc',
    elevation: 2,
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    paddingHorizontal: 10, 
    color: '#333', 
  },
  card: { 
    backgroundColor: '#fff', 
    margin: 15, 
    borderRadius: 15, 
    overflow: 'hidden', 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowOffset: { width: 0, height: 2 }, 
  },
  cardContent: { 
    padding: 15 
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#4caf50', 
    marginBottom: 5 
  },
  cardDetails: { 
    fontSize: 14, 
    marginBottom: 10 
  },
  actionButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  editButton: { 
    backgroundColor: '#4caf50', 
    padding: 10, 
    borderRadius: 10, 
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  deleteButton: { 
    backgroundColor: '#f44336', 
    padding: 10, 
    borderRadius: 10, 
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  editText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  deleteText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    alignSelf: 'center',
    width: '90%',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },  
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContent: { 
    width: '90%', 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 20, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowOffset: { width: 0, height: 2 } 
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center', 
    color: '#4caf50' 
  },
  input: { 
    height: 50, 
    borderColor: '#ddd', 
    borderWidth: 1, 
    borderRadius: 10, 
    marginBottom: 10, 
    paddingHorizontal: 10, 
    fontSize: 16, 
    backgroundColor: '#f9f9f9', 
    color: '#333' 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20 
  },
  totalSalaryContainer: {
    backgroundColor: '#4caf50',
    padding: 15,
    margin: 15,
    borderRadius: 10,
  },
  totalSalaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingVertical: 7, 
    backgroundColor: '#4caf50', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20 
  },
  footerItem: { 
    alignItems: 'center', 
    flex: 1 
  },
  footerIcon: { 
    width: 30, 
    height: 30, 
    marginBottom: 5, 
  },
});

export default DriverAdminScreen;