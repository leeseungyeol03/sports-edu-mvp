import React, { useEffect, useState, useContext } from 'react';
import { CheckCircle, Package, BookOpen, MessageSquare } from 'lucide-react';
import { apiClient, createCourseAdmin } from '../api/client';
import { UserContext } from '../App';
import ChatWindow from '../components/ChatWindow';

export default function AdminDashboard() {
  const { user } = useContext(UserContext);
  const [rentals, setRentals] = useState([]);
  const [activeTab, setActiveTab] = useState('rentals');
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedChatRental, setSelectedChatRental] = useState(null); // New state for chat modal
  
  const [newItem, setNewItem] = useState({
    name: '', category: '펜싱', total_qty: 1, rental_fee: 0, description: '', image_url: '📦'
  });

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    content_type: 'VIDEO',
    content_url: '',
    duration: null,
    equip_id: null,
  });

  useEffect(() => {
    if (activeTab === 'rentals') fetchRentals();
    if (activeTab === 'courses') fetchEquipmentForCourses();
  }, [activeTab]);

  const fetchRentals = async () => {
    try {
      const data = await apiClient.get('/rentals/all');
      setRentals(data);
    } catch (err) { console.error(err); }
  };

  const fetchEquipmentForCourses = async () => {
    try {
      const data = await apiClient.get('/equipment/');
      setEquipmentList(data);
      if (data.length > 0 && !newCourse.equip_id) {
        setNewCourse(prev => ({ ...prev, equip_id: data[0].equip_id }));
      }
    } catch (err) { console.error("Error fetching equipment for courses:", err); }
  };

  const handleApprove = async (rentalId) => {
    try {
      await apiClient.put(`/rentals/${rentalId}/approve`);
      alert("승인 완료!");
      fetchRentals();
    } catch (err) { console.error(err); }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/equipment/', { ...newItem, available_qty: newItem.total_qty });
      alert("장비 등록 성공!");
      setNewItem({ name: '', category: '펜싱', total_qty: 1, rental_fee: 0, description: '', image_url: '📦' });
    } catch (err) { alert("등록 실패: " + err.message); }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (newCourse.equip_id === null) {
      alert("강의를 연결할 장비를 선택해주세요.");
      return;
    }
    try {
      await createCourseAdmin(newCourse);
      alert("강의 등록 성공!");
      setNewCourse({
        title: '',
        description: '',
        content_type: 'VIDEO',
        content_url: '',
        duration: null,
        equip_id: equipmentList.length > 0 ? equipmentList[0].equip_id : null,
      });
    } catch (err) { alert("강의 등록 실패: " + (err.response?.data?.detail || err.message)); }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">관리자 대시보드</h1>
        <div className="flex gap-4 mb-8 border-b">
          <button onClick={() => setActiveTab('rentals')} className={`pb-2 px-4 font-bold ${activeTab === 'rentals' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>대여 요청 관리</button>
          <button onClick={() => setActiveTab('equipment')} className={`pb-2 px-4 font-bold ${activeTab === 'equipment' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>장비 등록</button>
          <button onClick={() => setActiveTab('courses')} className={`pb-2 px-4 font-bold ${activeTab === 'courses' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>강의 등록</button>
        </div>

        {activeTab === 'rentals' && (
          <div className="space-y-4">
            {rentals.length > 0 ? rentals.map(r => (
              <div key={r.rental_id} className="bg-white p-4 rounded-lg shadow border flex justify-between items-center">
                <div>
                  <span className={`text-xs font-bold px-2 py-1 rounded mr-2 ${r.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                  <span className="font-bold text-lg">{r.equipment?.name}</span>
                  <p className="text-sm text-gray-600 mt-1">{r.user?.name} ({r.user?.affiliation})</p>
                </div>
                <div className="flex items-center gap-2">
                  {r.status === 'PENDING' && (
                    <button onClick={() => handleApprove(r.rental_id)} className="bg-blue-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2"><CheckCircle size={16} /> 승인</button>
                  )}
                  <button onClick={() => setSelectedChatRental(r)} className="bg-gray-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2"><MessageSquare size={16} /> 채팅하기</button>
                </div>
              </div>
            )) : <p className="text-gray-500">대여 요청이 없습니다.</p>}
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="bg-white p-6 rounded-lg shadow border max-w-2xl">
            <form onSubmit={handleCreateItem} className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-4">새 장비 등록</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">장비명</label>
                <input type="text" id="name" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500" required />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">카테고리</label>
                <select id="category" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                  <option>펜싱</option>
                  <option>수영</option>
                  <option>양궁</option>
                  <option>사격</option>
                  <option>테니스</option>
                  <option>기타</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="total_qty" className="block text-sm font-medium text-gray-700">총 수량</label>
                  <input type="number" id="total_qty" value={newItem.total_qty} onChange={(e) => setNewItem({...newItem, total_qty: parseInt(e.target.value)})} min="1" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" required />
                </div>
                <div>
                  <label htmlFor="rental_fee" className="block text-sm font-medium text-gray-700">대여료 (원/일)</label>
                  <input type="number" id="rental_fee" value={newItem.rental_fee} onChange={(e) => setNewItem({...newItem, rental_fee: parseInt(e.target.value)})} min="0" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" required />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">상세설명</label>
                <textarea id="description" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"></textarea>
              </div>

              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">이미지 URL (이모지 가능)</label>
                <input type="text" id="image_url" value={newItem.image_url} onChange={(e) => setNewItem({...newItem, image_url: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
              </div>

              <button type="submit" className="w-full bg-purple-600 text-white py-2 px-4 rounded-md font-bold hover:bg-purple-700 flex items-center justify-center gap-2">
                <Package size={16} /> 장비 등록하기
              </button>
            </form>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="bg-white p-6 rounded-lg shadow border max-w-2xl">
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-4">새 강의 등록</h3>
              
              <div>
                <label htmlFor="course_title" className="block text-sm font-medium text-gray-700">강의명</label>
                <input type="text" id="course_title" value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500" required />
              </div>

              <div>
                <label htmlFor="course_equip" className="block text-sm font-medium text-gray-700">관련 장비</label>
                <select id="course_equip" value={newCourse.equip_id || ''} onChange={(e) => setNewCourse({...newCourse, equip_id: parseInt(e.target.value)})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" required>
                  <option value="" disabled>장비를 선택하세요</option>
                  {equipmentList.map(eq => (
                    <option key={eq.equip_id} value={eq.equip_id}>{eq.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="course_desc" className="block text-sm font-medium text-gray-700">강의 설명</label>
                <textarea id="course_desc" value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="course_type" className="block text-sm font-medium text-gray-700">콘텐츠 종류</label>
                  <select id="course_type" value={newCourse.content_type} onChange={(e) => setNewCourse({...newCourse, content_type: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                    <option>VIDEO</option>
                    <option>TEXT</option>
                    <option>IMAGE</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="course_duration" className="block text-sm font-medium text-gray-700">수강 기간 (일)</label>
                  <input type="number" id="course_duration" value={newCourse.duration || ''} onChange={(e) => setNewCourse({...newCourse, duration: e.target.value || null})} min="1" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
                </div>
              </div>

              <div>
                <label htmlFor="course_url" className="block text-sm font-medium text-gray-700">콘텐츠 URL</label>
                <input type="text" id="course_url" value={newCourse.content_url} onChange={(e) => setNewCourse({...newCourse, content_url: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500" required/>
              </div>

              <button type="submit" className="w-full bg-purple-600 text-white py-2 px-4 rounded-md font-bold hover:bg-purple-700 flex items-center justify-center gap-2">
                <BookOpen size={16} /> 강의 등록하기
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedChatRental && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg h-[70vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <ChatWindow 
              rentalId={selectedChatRental.rental_id}
              userId={user.user_id} 
              onClose={() => setSelectedChatRental(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}