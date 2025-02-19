import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, TouchableOpacity, Animated, PanResponder, Alert, ImageBackground } from 'react-native';
import { getAuth } from '@firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import 'react-native-gesture-handler';

const IndexScreen = () => {
  const [username, setUsername] = useState(''); // Lưu tên người dùng đăng nhập
  const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm trong danh sách xe
  const [cars, setCars] = useState([]); // Danh sách xe được tải từ Firestore
  const navigation = useNavigation(); // Điều hướng giữa các màn hình
  const [showChat, setShowChat] = useState(false); // Trạng thái hiển thị giao diện chatbot
  const [chatInput, setChatInput] = useState(''); // Dữ liệu đầu vào từ người dùng cho chatbot
  const [chatResponse, setChatResponse] = useState(''); // Kết quả phản hồi từ chatbot

  useEffect(() => {
    // Lấy tên người dùng từ Firebase Auth sau khi đăng nhập
    const auth = getAuth();
    const user = auth.currentUser; // Lấy thông tin người dùng hiện tại
    if (user) {
      setUsername(user.email.split('@')[0]); // Lấy phần tên trước @ từ email
    }
  }, []);

  // Vị trí biểu tượng AI Icon và chức năng kéo/thả
  const pan = useState(new Animated.ValueXY({ x: 350, y: 20 }))[0];
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true, // Bắt đầu PanResponder
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }), // Cập nhật vị trí
    onPanResponderRelease: () => {}, // Không cần hành động khi thả
  });

  // Lấy dữ liệu xe từ Firestore
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const carsCollection = collection(db, 'cars'); // Truy cập collection "cars"
        const carDocs = await getDocs(carsCollection); // Lấy dữ liệu từ Firestore
        const carsList = carDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          seats: doc.data().seats || 0, // Gán giá trị mặc định nếu thiếu trường seats
          name: doc.data().name || "Không có tên", // Gán giá trị mặc định nếu thiếu trường name
          price: doc.data().price || "Liên hệ", // Gán giá trị mặc định nếu thiếu trường price
        }));
        setCars(carsList); // Lưu danh sách xe vào state
      } catch (error) {
        console.error('Error fetching cars:', error); // Hiển thị lỗi nếu xảy ra
      }
    };

    fetchCars(); // Gọi hàm lấy dữ liệu
  }, []);

  // Bộ lọc danh sách xe theo từ khóa tìm kiếm
  const filteredCars = cars.filter(car =>
    car.name.toLowerCase().includes(searchTerm.toLowerCase()) // Kiểm tra từ khóa trong tên xe
  );

  // Xử lý chatbot
  const handleChat = async () => {
    try {
      // Kiểm tra nếu người dùng chưa nhập bất kỳ câu hỏi nào
      if (!chatInput || typeof chatInput !== "string") {
        setChatResponse("Xin hãy nhập yêu cầu của bạn trước khi nhấn gửi."); // Hiển thị thông báo yêu cầu nhập
        return; // Dừng xử lý
      }

      // Chuyển nội dung nhập từ người dùng sang chữ thường
      const inputLower = chatInput.toLowerCase();

      // Xử lý từ khóa "xe 5 chỗ"
      if (inputLower.includes("xe 5 chỗ")) {
        // Lọc danh sách xe có số ghế là 5
        const matchingCars = cars
          .filter(car => car.seats === 5) // Lọc các xe có trường "seats" bằng 5
          .map(car => `${car.name}: ${(car.price).toLocaleString('vi-VN')} VND`) // Lấy tên và giá của xe
          .join("\n"); // Nối danh sách xe thành chuỗi, mỗi xe trên một dòng

        if (matchingCars) {
          setChatResponse(`Danh sách xe 5 chỗ:\n${matchingCars}`); // Hiển thị danh sách xe 5 chỗ
        } else {
          setChatResponse("Không tìm thấy xe 5 chỗ nào trong hệ thống."); // Không tìm thấy xe 5 chỗ
        }
      }
      // Xử lý từ khóa "xe 7 chỗ"
      else if (inputLower.includes("xe 7 chỗ")) {
        // Lọc danh sách xe có số ghế là 7
        const matchingCars = cars
          .filter(car => car.seats === 7) // Lọc các xe có trường "seats" bằng 7
          .map(car => `${car.name}: ${(car.price).toLocaleString('vi-VN')} VND`) // Lấy tên và giá của xe
          .join("\n"); // Nối danh sách xe thành chuỗi, mỗi xe trên một dòng

        if (matchingCars) {
          setChatResponse(`Danh sách xe 7 chỗ:\n${matchingCars}`); // Hiển thị danh sách xe 7 chỗ
        } else {
          setChatResponse("Không tìm thấy xe 7 chỗ nào trong hệ thống."); // Không tìm thấy xe 7 chỗ
        }
      }
      // Nếu không khớp từ khóa nào
      else {
        setChatResponse("Xin lỗi, tôi không hiểu yêu cầu của bạn. Hãy thử nhập từ khóa như 'xe 5 chỗ' hoặc 'xe 7 chỗ'.");
      }
    } catch (error) {
      // Xử lý lỗi khi truy vấn Firestore
      Alert.alert("Chatbot error:", error.message); // Hiển thị thông báo lỗi
      setChatResponse("Xin lỗi, có lỗi xảy ra khi lấy danh sách xe."); // Thông báo lỗi đến người dùng
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào quý khách: {username}</Text>
      </View>

      <ImageBackground source={require('../assets/bgAppThueXe.jpg')} style={styles.background}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập tìm kiếm"
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <TouchableOpacity>
            <Image source={require('../assets/search-icon.jpg')} style={styles.searchIcon} />
          </TouchableOpacity>
        </View>

        {/* List of Cars */}
        <ScrollView style={styles.carList}>
          {filteredCars.map(car => (
            <TouchableOpacity
              key={car.id}
              style={styles.carCard}
              onPress={() => navigation.navigate('CarDetailScreen', { car })}
            >
              <Image source={{ uri: car.image }} style={styles.carImage} />
              <Text style={styles.carDescription}>{car.name}</Text>
              <Text style={styles.carPrice}>{car.price.toLocaleString('vi-VN')} VND/ngày</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ImageBackground>
       {/* Chatbot AI Icon */}
    <Animated.View
      style={[styles.aiIcon, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity onPress={() => setShowChat(!showChat)}>
        <Image source={require('../assets/TdmuAi.png')} style={styles.aiImage} />
      </TouchableOpacity>
    </Animated.View>

    {/* Chat Interface */}
    {showChat && (
      <View style={styles.centeredChatContainer}>
        {/* Header Chat */}
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>CHAT BOX HỖ TRỢ</Text>
          <TouchableOpacity onPress={() => setShowChat(false)}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {/* Phản hồi từ Chatbot */}
        <ScrollView style={styles.chatResponse}>
          <Text style={styles.chatText}>{chatResponse}</Text>
        </ScrollView>

        {/* Input Gửi Câu Hỏi */}
        <TextInput
          style={styles.chatInput}
          placeholder="Nhập câu hỏi của bạn"
          value={chatInput}
          onChangeText={setChatInput}
        />
        <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
          <Text style={styles.chatButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    )}

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
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  greeting: {
    fontSize: 20,
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
  searchIcon: {
    width: 24,
    height: 24,
  },
  carList: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  carCard: {
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: 150,
  },
  carDescription: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50', 
    margin: 10,
  },
  carPrice: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 10,
    marginBottom: 10,
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
  aiIcon: {
    position: 'absolute',
    zIndex: 10,
    width: 60,
    height: 60,
  },
  aiImage: {
    width: '100%',
    height: '100%',
  },
  centeredChatContainer: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    elevation: 10,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  closeButton: {
    fontSize: 20,
    color: '#FF0000',
    fontWeight: 'bold',
  },
  chatResponse: {
    maxHeight: 150,
    marginVertical: 10,
  },
  chatText: {
    fontSize: 16,
    color: '#333',
  },
  chatInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  chatButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  chatButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default IndexScreen;