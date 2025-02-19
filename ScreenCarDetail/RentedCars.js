import React, { useState, useEffect } from 'react';
import { Alert, View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getAuth } from 'firebase/auth';
import 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const RentedCars = () => {
  const [rentedCars, setRentedCars] = useState([]);
  const auth = getAuth();
  const navigation = useNavigation();

  // // Lấy danh sách xe đã thuê của người dùng hiện tại
  // const fetchRentedCars = async () => {
  //   try {
  //     const user = auth.currentUser;
  //     if (!user) return;

  //     const rentedCarsCollection = collection(db, 'RentedCars');
  //     const q = query(rentedCarsCollection, where('userId', '==', user.uid));
  //     const rentedCarDocs = await getDocs(q);

  //     const rentedCarList = rentedCarDocs.docs.map((doc) => ({
  //       idThueXe: doc.id,
  //       ...doc.data(),
  //     }));
  //     setRentedCars(rentedCarList);
  //   } catch (error) {
  //     console.error('Lỗi khi lấy danh sách xe đã thuê:', error);
  //   }
  // };
  
// Lấy danh sách xe đã thuê của người dùng hiện tại kèm thông tin tài xế
const fetchRentedCars = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const rentedCarsCollection = collection(db, 'RentedCars');
    const q = query(rentedCarsCollection, where('userId', '==', user.uid));
    const rentedCarDocs = await getDocs(q);

    const rentedCarList = await Promise.all(
      rentedCarDocs.docs.map(async (doc) => {
        const rentedCarData = doc.data();

        // Lấy thông tin tài xế từ Firestore
        let driverData = null;
        if (rentedCarData.driverId) {
          const driverDoc = await getDocs(collection(db, 'drivers'));
          driverData = driverDoc.docs
            .find((d) => d.id === rentedCarData.driverId)
            ?.data();
        }

        return {
          idThueXe: doc.id,
          ...rentedCarData,
          driver: driverData, // Gắn thông tin tài xế vào xe đã thuê
        };
      })
    );

    setRentedCars(rentedCarList);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách xe đã thuê:', error);
  }
};

  
  // Hàm xóa tất cả xe của người dùng hiện tại
  const handleDeleteAllCarsByUserId = async () => {
    const user = auth.currentUser;
    if (!user) return;

    Alert.alert(
      "Xóa tất cả xe đã thuê",
      "Bạn có chắc chắn muốn xóa tất cả xe đã thuê không?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        { 
          text: "Xóa tất cả", 
          onPress: async () => {
            try {
              const rentedCarsCollection = collection(db, 'RentedCars');
              const q = query(rentedCarsCollection, where('userId', '==', user.uid));
              const rentedCarDocs = await getDocs(q);

              // Xóa từng document dựa trên userId
              const deletePromises = rentedCarDocs.docs.map(doc => deleteDoc(doc.ref));
              await Promise.all(deletePromises);

              // Cập nhật lại danh sách xe sau khi xóa
              setRentedCars([]);
              Alert.alert("Thông báo", "Tất cả xe đã thuê đã được xóa thành công!");
            } catch (error) {
              console.error("Error deleting cars by userId:", error);
              Alert.alert("Lỗi", "Không thể xóa tất cả xe.");
            }
          }
        }
      ]
    );
  };
  
  useEffect(() => {
    fetchRentedCars();
  }, []);

  // Xóa một giao dịch thuê xe
  const handleDeleteCar = async (idThueXe) => {
    Alert.alert(
      'Xóa xe đã thuê',
      'Bạn có chắc chắn muốn xóa xe này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              const carDocRef = doc(db, 'RentedCars', idThueXe);
              await deleteDoc(carDocRef);
              setRentedCars((prevCars) =>
                prevCars.filter((car) => car.idThueXe !== idThueXe)
              );
              Alert.alert('Thành công', 'Xe đã được xóa thành công!');
            } catch (error) {
              console.error('Lỗi khi xóa xe:', error.message);
              Alert.alert('Lỗi', 'Không thể xóa xe.');
            }
          },
        },
      ]
    );
  };

  // return (
    // <View style={styles.container}>
    //   {/* Header */}
    //   <View style={styles.header}>
    //     <Text style={styles.headerText}>Xe Đã Thuê</Text>
    //   </View>

    //   {/* Background Image with Car List */}
    //   <ImageBackground
    //     source={require('../assets/bgAppThueXe.jpg')}
    //     style={styles.background}
    //   >
  //       <ScrollView contentContainerStyle={styles.scrollContainer}>
  //         {rentedCars.length > 0 ? (
  //           rentedCars.map(car => (
  //             <View key={car.idThueXe} style={styles.carCard}>
  //               <Image source={{ uri: car.picture || car.image }} style={styles.carImage} />

  //               <View style={styles.totalContainer}>
  //                 <Text style={styles.totalText}>Ngày thuê: {new Date(car.rentDate).toLocaleDateString()}</Text>
  //                 <Text style={styles.totalText}>Ngày trả: {new Date(car.returnDate).toLocaleDateString()}</Text>
  //                 <Text style={styles.totalText}>Tổng tiền thuê xe: {car.totalPrice.toLocaleString('vi-VN')} VND</Text>
  //               </View>

  //               <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCar(car.idThueXe)}>
  //                 <Text style={styles.deleteButtonText}>Xóa xe đã thuê</Text>
  //               </TouchableOpacity>
  //             </View>
  //           ))
  //         ) : (
  //           <View style={styles.emptyContainer}>
  //             <Text style={styles.emptyText}>Bạn chưa thuê xe nào.</Text>
  //           </View>
  //         )}
  //       </ScrollView>
  //     </ImageBackground>

  //     {/* Nút xóa tất cả xe */}
  //     {rentedCars.length > 0 && (
  //       <TouchableOpacity 
  //         style={styles.deleteAllButton} 
  //         onPress={handleDeleteAllCarsByUserId}
  //       >
  //         <Text style={styles.deleteAllButtonText}>Xóa tất cả xe đã thuê</Text>
  //       </TouchableOpacity>
  //     )}

  return (
    <View style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.headerText}>Xe Đã Thuê</Text>
    </View>

    {/* Background Image with Car List */}
    <ImageBackground
      source={require('../assets/bgAppThueXe.jpg')}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {rentedCars.length > 0 ? (
          rentedCars.map((car) => (
            <View key={car.idThueXe} style={styles.carCard}>
              <Image source={{ uri: car.picture || car.image }} style={styles.carImage} />
    
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Ngày thuê: {new Date(car.rentDate).toLocaleDateString()}</Text>
                <Text style={styles.totalText}>Ngày trả: {new Date(car.returnDate).toLocaleDateString()}</Text>
                <Text style={styles.totalText}>Tổng tiền thuê xe: {car.totalPrice.toLocaleString('vi-VN')} VND</Text>
    
                {/* Hiển thị thông tin tài xế nếu có */}
                {car.driver && (
                  <>
                    <Text style={styles.driverInfo}>Tài xế: {car.driver.name}</Text>
                    <Text style={styles.driverInfo}>SĐT: {car.driver.phone}</Text>
                    <Text style={styles.driverInfo}>Địa chỉ: {car.driver.address}</Text>
                  </>
                )}
              </View>
    
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteCar(car.idThueXe)}
              >
                <Text style={styles.deleteButtonText}>Xóa xe đã thuê</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bạn chưa thuê xe nào.</Text>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f0a500',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollContainer: {
    padding: 20,
  },
  carCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  carImage: {
    width: '100%',
    height: 200,
  },
  totalContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 30,
    color: '#555',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
  },
  deleteAllButton: {
    backgroundColor: '#d9534f',
    padding: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  deleteAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
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

export default RentedCars;