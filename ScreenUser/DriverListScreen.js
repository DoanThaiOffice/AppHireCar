import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const DriverListScreen = () => {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();

  // Lấy danh sách tài xế từ Firestore
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const driversCollection = collection(db, 'drivers');
        const driverDocs = await getDocs(driversCollection);
        const driversList = driverDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDrivers(driversList);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };

    fetchDrivers();
  }, []);

  // Lọc tài xế theo nội dung tìm kiếm
  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh Sách Tài Xế</Text>
      </View>

      <ImageBackground source={require('../assets/bgAppThueXe.jpg')} style={styles.background}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập tìm kiếm tài xế"
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* List of Drivers */}
        <ScrollView style={styles.driverList}>
          {filteredDrivers.map(driver => (
            <View key={driver.id} style={styles.driverCard}>
              <Image source={require('../assets/carDriver.jpg')} style={styles.driverImage} />
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.driverPhone}>SĐT: {driver.phone}</Text>
                <Text style={styles.driverAddress}>Địa chỉ: {driver.address}</Text>
                <Text style={styles.driverSalary}>
                  Giá: {driver.salary.toLocaleString('vi-VN')} VND/ngày
                </Text>
                {/* <TouchableOpacity
                  style={styles.hireButton}
                  onPress={() => navigation.navigate('RentedCars', { driver })} // Chuyển đến RentedCars với dữ liệu tài xế
                >
                  <Text style={styles.hireButtonText}>Thuê tài xế</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          ))}
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
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#4caf50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10,
    color: '#333',
  },
  driverList: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  driverCard: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    overflow: 'hidden',
  },
  driverImage: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  driverInfo: {
    flex: 1,
    padding: 10,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  driverPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  driverAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  driverSalary: {
    fontSize: 14,
    color: '#4caf50',
    marginBottom: 10,
  },
  hireButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  hireButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
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

export default DriverListScreen;