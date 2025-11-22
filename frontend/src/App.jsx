import React, { useState, useEffect, createContext } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import MyRentals from './pages/MyRentals';
import DetailModal from './components/Detailmodal';
import AdminDashboard from './pages/AdminDashboard';
import MyPage from './pages/MyPage';
import Classroom from './pages/Classroom';
import { apiClient } from './api/client';

export const UserContext = createContext(null);

export default function App() {
  const [view, setView] = useState('login'); 
  const [user, setUser] = useState(null);
  const [equipmentData, setEquipmentData] = useState([]); 
  const [rentals, setRentals] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRentalForClassroom, setSelectedRentalForClassroom] = useState(null);

  useEffect(() => {
    fetchEquipment();
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserInfo();
    }
  }, []);

  const fetchEquipment = async () => {
    try {
      const data = await apiClient.get('/equipment/');
      setEquipmentData(data);
    } catch (err) { console.error(err); }
  };

  const fetchUserInfo = async () => {
    try {
      const userData = await apiClient.get('/users/me');
      setUser(userData);
      
      if (userData.role === 'ADMIN') setView('admin'); 
      else setView('catalog');
      
      if (userData.role !== 'ADMIN') fetchMyRentals();
    } catch (err) { 
      handleLogout(); 
    }
  };

  const fetchMyRentals = async () => {
    try {
      const data = await apiClient.get('/rentals/my');
      setRentals(data);
    } catch (err) { console.error(err); }
  };

  const handleLogin = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const data = await apiClient.post('/users/login', formData, true);
      localStorage.setItem('access_token', data.access_token);
      fetchUserInfo();
    } catch (err) { alert("로그인 실패: " + err.message); }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    setView('login');
  };

  const handleRent = async (rentalInfo) => {
      try {
        await apiClient.post('/rentals/', {
          equip_id: rentalInfo.equip_id, 
          start_date: new Date(rentalInfo.startDate).toISOString(),
          end_date: new Date(rentalInfo.endDate).toISOString(),
          reason: rentalInfo.reason
        });
        alert("신청 완료! 관리자 승인을 기다려주세요.");
        setSelectedItem(null);
        fetchMyRentals();
      } catch (err) { alert("대여 실패: " + err.message); }
  };

  const handleViewClassroom = (rentalId) => {
    const foundRental = rentals.find(r => r.rental_id === rentalId);
    if (foundRental) {
      setSelectedRentalForClassroom(foundRental);
      setView('classroom');
    } else {
      console.error("해당 렌탈 정보를 찾을 수 없습니다:", rentalId);
      // Optionally, handle the case where the rental is not found
    }
  };

  const renderView = () => {
    switch(view) {
      case 'login': 
        return <Login onLogin={handleLogin} />;
      case 'catalog': 
        return <Catalog data={equipmentData} onSelect={setSelectedItem} />;
      case 'my-rentals': 
        return <MyRentals rentals={rentals} onCancel={()=>{/*취소로직*/}} onViewClassroom={handleViewClassroom} />;
      case 'mypage':
        return <MyPage />;
      case 'admin': 
        return user?.role === 'ADMIN' ? <AdminDashboard /> : <div className="p-8">권한이 없습니다.</div>;
      default: 
        return <Catalog data={equipmentData} onSelect={setSelectedItem} />;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {view === 'classroom' ? (
        <Classroom rental={selectedRentalForClassroom} onExit={() => setView('my-rentals')} />
      ) : (
        <div className="min-h-screen bg-white font-sans text-slate-900">
          {view !== 'login' && (
            <div className="sticky top-0 z-50 bg-white shadow-sm">
                <Navbar user={user} onLogout={handleLogout} setView={setView} />
                {user?.role === 'ADMIN' && (
                    <div className="bg-slate-900 text-white text-center py-2 text-sm cursor-pointer hover:bg-slate-800" onClick={() => setView('admin')}>
                        🔧 관리자 모드로 이동
                    </div>
                )}
            </div>
          )}
          <main>{renderView()}</main>
          {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onRent={handleRent} />}
        </div>
      )}
    </UserContext.Provider>
  );
}