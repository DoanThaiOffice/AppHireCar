import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity,Alert ,TextInput, Modal, Button, ImageBackground } from 'react-native';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from '@firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import thư viện icon

const AdminScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();
  const [newCar, setNewCar] = useState({
    name: '',
    price: '',
    image: '',
    color: '',
    description: '',
    fuel: '',
    fuelconsumption: '',
    seats: '',
    transmission: '',
    kind: '',
  });

  useEffect(() => {
    // Đăng ký một hàm lắng nghe thay đổi dữ liệu từ Firestore.
    const unsubscribe = onSnapshot(collection(db, 'cars'), (snapshot) => {
      // Lấy dữ liệu từ snapshot và chuyển nó thành mảng các đối tượng.
      const carsData = snapshot.docs.map((doc) => ({
        id: doc.id,    
        ...doc.data(),
      }));
      
      setCars(carsData);
      
      // Cập nhật trạng thái filteredCars với dữ liệu mới, có thể dùng cho việc lọc sau này.
      setFilteredCars(carsData);
    });
  
    return unsubscribe;
  }, []);
  

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = cars.filter((car) =>
      car.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCars(filtered);
  };

  const openEditModal = (car) => {
    setNewCar(car);
    setEditingCarId(car.id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleAddCar = async () => {
    try {
      // Kiểm tra các trường dữ liệu có đầy đủ hay không
      if (
        !newCar.name ||
        !newCar.price ||
        !newCar.image ||
        !newCar.color ||
        !newCar.description ||
        !newCar.fuel ||
        !newCar.fuelconsumption ||
        !newCar.seats ||
        !newCar.transmission ||
        !newCar.kind
      ) {
        Alert.alert('Vui lòng nhập đầy đủ thông tin!');
        return;
      }
  
      // Thêm xe mới vào Firestore
      await addDoc(collection(db, 'cars'), {
        ...newCar,
        price: parseInt(newCar.price), // Chuyển giá -> int
        seats: parseInt(newCar.seats),
        fuelconsumption: parseFloat(newCar.fuelconsumption), // Chuyển tiêu thụ nhiên liệu ->float
        status: 'có sẵn', // Mặc định trạng thái ban đầu là "có sẵn"
      });
  
      console.log('Xe đã được thêm thành công!');
      Alert.alert('Thêm xe mới thành công!');
      setModalVisible(false);
      resetForm(); // Reset form sau khi thêm
    } catch (error) {
      console.error('Lỗi khi thêm xe:', error.message);
      alert('Có lỗi xảy ra khi thêm xe.');
    }
  };
  

  const handleEditCar = async () => {
    try {
      const carDocRef = doc(db, 'cars', editingCarId);
      await updateDoc(carDocRef, {
        ...newCar,
        price: parseInt(newCar.price),
        seats: parseInt(newCar.seats),
        fuelconsumption: parseFloat(newCar.fuelconsumption),
      });
      console.log('Xe đã được cập nhật!');
      setModalVisible(false);
      setIsEditing(false);
      setEditingCarId(null);
      resetForm();
    } catch (error) {
      console.error('Lỗi khi chỉnh sửa xe:', error.message);
    }
  };

  // const handleDeleteCar = async (carId) => {
  //   try {
  //     const carDocRef = doc(db, 'cars', carId);
  //     await deleteDoc(carDocRef);
  //     console.log('Xe đã bị xóa!');
  //   } catch (error) {
  //     console.error('Lỗi khi xóa xe:', error.message);
  //   }
  // };

  const handleDeleteCar = async (carId) => {
    // Hiển thị hộp thoại xác nhận
    Alert.alert(
      'Xác nhận xóa xe',   // Tiêu đề của hộp thoại
      'Bạn có chắc chắn muốn xóa xe này?',  // Nội dung hộp thoại
      [
        {
          text: 'Hủy',   // Nút Hủy
          onPress: () => console.log('Hành động xóa xe đã bị hủy'),  // Nếu người dùng chọn "Hủy"
          style: 'cancel', // Thay đổi kiểu của nút "Hủy" (để nó nằm ở bên trái)
        },
        {
          text: 'Xóa',    // Nút Xóa
          onPress: async () => {
            try {
              const carDocRef = doc(db, 'cars', carId);
              await deleteDoc(carDocRef);
              console.log('Xe đã bị xóa!');
            } catch (error) {
              console.error('Lỗi khi xóa xe:', error.message);
            }
          },  // Nếu người dùng chọn "Xóa"
        },
      ],
      { cancelable: true }  // Cho phép người dùng bấm ra ngoài để hủy (nếu cần)
    );
  };
  

  const resetForm = () => {
    setNewCar({
      name: '',
      price: '',
      image: '',
      color: '',
      description: '',
      fuel: '',
      fuelconsumption: '',
      seats: '',
      transmission: '',
      kind: '',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={
          { uri: item.image }
        }
        style={styles.carImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.carTitle}>{item.name}</Text>
        <Text style={styles.carPrice}>{item.price.toLocaleString()} VND/ngày</Text>
        <Text style={styles.carDescription}>{item.description}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
            <Text style={styles.editText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCar(item.id)}>
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
          <Text style={styles.headerTitle}>Quản Trị Xe</Text>
        </View>
  
        {/* Thanh tìm kiếm */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập tìm kiếm"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
  
        {/* Nút thêm xe */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)} // Hoặc điều hướng đến màn hình thêm xe
        >
          <Text style={styles.addButtonText}>+ Thêm xe</Text>
        </TouchableOpacity>
  
        {/* Danh sách xe */}
        <FlatList
          data={filteredCars}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
  
        {/* Modal Thêm/Chỉnh sửa xe */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          {/* Nội dung Modal */}
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{isEditing ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</Text>
              {/* Các trường nhập liệu */}
              <TextInput
                style={styles.input}
                placeholder="Tên xe"
                value={newCar.name}
                onChangeText={(text) => setNewCar({ ...newCar, name: text })}
                keyboardType="default"
              />
              <TextInput
                style={styles.input}
                placeholder="Giá thuê (VND)"
                value={newCar.price}
                onChangeText={(text) => setNewCar({ ...newCar, price: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="URL hình ảnh"
                value={newCar.image}
                onChangeText={(text) => setNewCar({ ...newCar, image: text })}
                keyboardType="default"
              />
              <TextInput
                style={styles.input}
                placeholder="Màu sắc"
                value={newCar.color}
                onChangeText={(text) => setNewCar({ ...newCar, color: text })}
                keyboardType="default"
              />
              <TextInput
                style={styles.input}
                placeholder="Mô tả"
                value={newCar.description}
                onChangeText={(text) => setNewCar({ ...newCar, description: text })}
                keyboardType="default"
              />
              <TextInput
                style={styles.input}
                placeholder="Nhiên liệu"
                value={newCar.fuel}
                onChangeText={(text) => setNewCar({ ...newCar, fuel: text })}
                keyboardType="default"
              />
              <TextInput
                style={styles.input}
                placeholder="Tiêu thụ nhiên liệu (lít/100km)"
                value={newCar.fuelconsumption}
                onChangeText={(text) => setNewCar({ ...newCar, fuelconsumption: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Số chỗ"
                value={newCar.seats}
                onChangeText={(text) => setNewCar({ ...newCar, seats: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Hộp số"
                value={newCar.transmission}
                onChangeText={(text) => setNewCar({ ...newCar, transmission: text })}
                keyboardType="default"
              />
              <TextInput
                style={styles.input}
                placeholder="Loại xe (SUV, Sedan...)"
                value={newCar.kind}
                onChangeText={(text) => setNewCar({ ...newCar, kind: text })}
                keyboardType="default"
              />
              {/* Các trường khác */}
              <View style={styles.modalButtons}>
                <Button title="Hủy" onPress={() => setModalVisible(false)} color="#888" />
                {isEditing ? (
                  <Button title="Sửa" onPress={handleEditCar} color="#4caf50" />
                ) : (
                  <Button title="Thêm" onPress={handleAddCar} color="#4caf50" />
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
  carImage: { 
    width: '100%', 
    height: 150, 
    borderTopLeftRadius: 15, 
    borderTopRightRadius: 15, 
  },
  cardContent: { 
    padding: 15 
  },
  carTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#4caf50', 
    marginBottom: 5 
  },
  carPrice: { 
    fontSize: 18, 
    marginBottom: 10 
  },
  carDescription: { 
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
    marginVertical: 10, // Thêm khoảng cách trên và dưới
    alignSelf: 'center', // Canh giữa theo chiều ngang
    width: '90%', // Đặt độ rộng cho phù hợp với giao diện
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

export default AdminScreen;
