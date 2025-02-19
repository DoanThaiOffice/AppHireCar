import { Alert, View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ImageBackground,navigation } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { getAuth } from '@firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc,getDoc ,setDoc, collection, updateDoc, getDocs, query, where } from 'firebase/firestore';

const CarDetailScreen = ({ route, navigation }) => {
  const { car } = route.params;
  const auth = getAuth();

  const [rentDate, setRentDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [showRentDatePicker, setShowRentDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Tính toán số ngày thuê và tổng tiền khi `rentDate` hoặc `returnDate` thay đổi
  useEffect(() => {
    if (rentDate && returnDate) {
      const totalDays = calculateDays(rentDate, returnDate);
      setTotalPrice(totalDays * car.price); // Cập nhật `totalPrice` mỗi khi ngày thay đổi
    }
  }, [rentDate, returnDate]);

  // Hàm xử lý tính tổng số ngày thuê
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start.setHours(0, 0, 0, 0));
    const endDate = new Date(end.setHours(0, 0, 0, 0));

    if (endDate < startDate) {
      alert('Ngày trả phải lớn hơn hoặc bằng ngày thuê'); // Thông báo nếu ngày trả nhỏ hơn ngày thuê
      return 0;
    }

    const diffTime = endDate - startDate;
    return (diffTime / (1000 * 60 * 60 * 24)) + 1; // Tính tổng số ngày thuê
  };

  const handleRentCar = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để thuê xe.");
      return;
    }
  
    if (rentDate && returnDate) {
      try {
        const startDate = new Date(rentDate.setHours(0, 0, 0, 0)).toISOString();
        const endDate = new Date(returnDate.setHours(0, 0, 0, 0)).toISOString();
  
        // Fetch user details from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
  
        if (!userDocSnap.exists()) {
          Alert.alert("Yêu cầu", "Cập nhật thông tin trước khi thuê xe ?");
          return;
        }
  
        const userData = userDocSnap.data(); // lấy dữ liệu người dùng
        let { phoneNumber, username } = userData; // lấy số điện thoại và tên người dùng
  
        // Kiểm tra nếu chưa có tên và số điện thoại
        if (!username || !phoneNumber) {
          // Hiển thị thông báo yêu cầu người dùng nhập tên và số điện thoại
          Alert.alert(
            "Thông báo",
            "Vui lòng cập nhật đầy đủ thông tin: tên và số điện thoại trước khi thuê xe.",
            [
              {
                text: "Cập nhật",
                onPress: () => {
                  // Điều hướng đến trang cập nhật thông tin người dùng (nếu có)
                  navigation.navigate('UpdateProfile');
                }
              }
            ]
          );
          return;
        }
  
        // Kiểm tra có trùng ngày không
        const rentedCarsQuery = query(
          collection(db, 'RentedCars'),
          where('carId', '==', car.id),
          where('rentDate', '<=', endDate),
          where('returnDate', '>=', startDate)
        );
        const querySnapshot = await getDocs(rentedCarsQuery);
  
        if (!querySnapshot.empty) {
          Alert.alert(
            "Thông báo",
            "Ngày này đã được thuê, vui lòng chọn ngày khác."
          );
          return;
        }
  
        // Lưu vào db mới rentedCars
        const rentedCarRef = doc(collection(db, 'RentedCars'));
        const idThueXe = rentedCarRef.id;
  
        // Lưu dữ liệu thuê xe vào Firestore
        await setDoc(rentedCarRef, {
          ...car,
          idThueXe: idThueXe,
          userId: user.uid,
          username: username || "Người dùng chưa có tên",
          phoneNumber: phoneNumber || "Chưa có số điện thoại",
          carId: car.id,
          rentDate: startDate,
          returnDate: endDate,
          totalPrice: totalPrice,
        });
  
        // Cập nhật trạng thái xe
        const carRef = doc(db, 'cars', car.id);
        await updateDoc(carRef, {
          status: 'đã thuê',
        });
  
        Alert.alert("Thông báo", "Thuê xe thành công!");
        navigation.navigate('RentedCars');
      } catch (error) {
        console.error('Lỗi khi thuê xe:', error.message);
        Alert.alert("Lỗi", "Có lỗi xảy ra khi thuê xe, vui lòng thử lại.");
      }
    }
  };      

  // Định dạng `totalPrice` theo kiểu tiền Việt Nam
  const formattedTotalPrice = totalPrice.toLocaleString('vi-VN');

  return (
    <ImageBackground
      source={require('../assets/bgAppThueXe.jpg')}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: car.image }} style={styles.carImage} />
        
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{car.name}</Text>
          <Text style={styles.price}>{car.price.toLocaleString('vi-VN')} VND/ngày</Text>
          <Text style={styles.detailsTitle}>Thông số kỹ thuật</Text>
          <Text style={styles.detailsText}>Số chỗ: {car.seats}</Text>
          <Text style={styles.detailsText}>Loại xe: {car.type}</Text>
          <Text style={styles.detailsText}>Hộp số: {car.transmission}</Text>
          <Text style={styles.detailsText}>Màu sắc: {car.color}</Text>
          <Text style={styles.detailsText}>Nhiên liệu: {car.fuel}</Text>
          <Text style={styles.detailsText}>Tiêu thụ nhiên liệu: {car.fuelConsumption} lít/100km</Text>
        </View>

        <View style={styles.datePickerContainer}>
          <Text style={styles.datePickerTitle}>Chọn ngày thuê</Text>
          <TouchableOpacity onPress={() => setShowRentDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Chọn ngày thuê</Text>
          </TouchableOpacity>
          {rentDate && <Text style={styles.dateText}>Ngày thuê: {rentDate.toLocaleDateString()}</Text>}
          
          <Text style={styles.datePickerTitle}>Chọn ngày trả</Text>
          <TouchableOpacity onPress={() => setShowReturnDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Chọn ngày trả</Text>
          </TouchableOpacity>
          {returnDate && <Text style={styles.dateText}>Ngày trả: {returnDate.toLocaleDateString()}</Text>}
        </View>

        {showRentDatePicker && (
          <DateTimePicker   //tạo lịch
            value={rentDate || new Date()}
            mode="date"   // -> set date ko lấy time
            display="default"
            onChange={(event, selectedDate) => {
              setShowRentDatePicker(false);
              if (selectedDate) setRentDate(selectedDate);
            }}
          />
        )}

        {showReturnDatePicker && (
          <DateTimePicker
            value={returnDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowReturnDatePicker(false);
              if (selectedDate) setReturnDate(selectedDate);
            }}
          />
        )}

        {rentDate && returnDate && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Tổng số ngày: {calculateDays(rentDate, returnDate)} ngày</Text>
            <Text style={styles.totalText}>Tổng tiền: {formattedTotalPrice} VND</Text>
          </View>
        )}

        <TouchableOpacity style={styles.rentButton} onPress={handleRentCar}>
          <Text style={styles.rentButtonText}>Thuê Ngay</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

  const styles = StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: 'cover',
    },
    container: {
      padding: 20,
      alignItems: 'center',
    },
    carImage: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
    },
    price: {
      fontSize: 18,
      color: '#f0a500',
      marginBottom: 20,
    },
    detailsContainer: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      width: '100%',
      marginBottom: 20,
      elevation: 3,
    },
    detailsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
    },
    detailsText: {
      fontSize: 16,
      marginBottom: 5,
      color: '#555',
    },
    descriptionContainer: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      width: '100%',
      marginBottom: 20,
      elevation: 3,
    },
    descriptionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
    },
    descriptionText: {
      fontSize: 16,
      color: '#555',
    },
    rentButton: {
      backgroundColor: '#f0a500',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      width: '100%',
    },
    rentButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    datePickerContainer: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      width: '100%',
      marginBottom: 20,
      elevation: 3,
    },
    dateButton: {
      backgroundColor: '#f0a500',
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 10,
    },
    dateButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    datePickerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#333',
    },
    dateText: {
      fontSize: 16,
      color: '#555',
      marginBottom: 10,
    },
    totalContainer: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      width: '100%',
      marginBottom: 20,
      elevation: 3,
    },
    totalText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 5,
    },
  });

  export default CarDetailScreen;