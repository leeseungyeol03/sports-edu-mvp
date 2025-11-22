import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, PlayCircle, FileText } from 'lucide-react';
import { apiClient } from '../api/client'; // Import apiClient

// 별점 컴포넌트 (내부용)
const StarRating = ({ rating, count }) => (
  <div className="flex items-center space-x-1 text-xs font-bold text-yellow-600">
    <span className="mr-1">{rating}</span>
    <div className="flex text-yellow-500">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={12} fill={i < Math.floor(rating) ? "currentColor" : "none"} />
      ))}
    </div>
    <span className="text-gray-400 font-normal">({count})</span>
  </div>
);

export default function DetailModal({ item, onClose, onRent }) { // Removed 'courses' prop
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [courseList, setCourseList] = useState([]); // New state for courses
  const [loadingCourses, setLoadingCourses] = useState(false); // New state for loading
  const [courseError, setCourseError] = useState(null); // New state for error

  useEffect(() => {
    if (item && item.equip_id) {
      setLoadingCourses(true);
      setCourseError(null);
      const fetchCourses = async () => {
        try {
          const data = await apiClient.get(`/courses/?equip_id=${item.equip_id}`);
          setCourseList(data);
        } catch (err) {
          console.error("Failed to fetch courses for equipment:", err);
          setCourseError("강의 목록을 불러오는데 실패했습니다.");
        } finally {
          setLoadingCourses(false);
        }
      };
      fetchCourses();
    } else {
      setCourseList([]); // Clear courses if no item selected
    }
  }, [item]); // Re-fetch when item changes

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden my-8 mx-4 flex flex-col md:flex-row">
        
        <div className="flex-1 p-8 overflow-y-auto max-h-[80vh]">
          <div className="text-sm font-bold text-purple-600 mb-2">{item.category} &gt; {item.instructor ? item.instructor.name : '관리자'}</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{item.name}</h2>
          <p className="text-lg text-gray-700 mb-6">{item.description}</p>
          
          <div className="flex items-center gap-4 mb-8 text-sm text-gray-600">
             <StarRating rating={item.rating} count={item.review_count} />
             <span>• 최근 업데이트: 2024.03</span>
             <span>• 한국어</span>
          </div>

          <div className="border p-4 rounded-lg bg-gray-50 mb-8">
            <h3 className="font-bold text-lg mb-4">이 장비를 대여하면 배울 수 있어요</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              <li className="flex items-start gap-2"><CheckCircle size={16} className="mt-0.5" /> 안전한 장비 사용법 숙지</li>
              <li className="flex items-start gap-2"><CheckCircle size={16} className="mt-0.5" /> 종목별 기초 자세 훈련</li>
            </ul>
          </div>

          <h3 className="font-bold text-xl mb-4">커리큘럼 구성</h3>
          {loadingCourses ? (
            <div className="p-4 text-center text-gray-500">강의 목록을 불러오는 중...</div>
          ) : courseError ? (
            <div className="p-4 text-center text-red-500">강의 목록을 불러오는데 실패했습니다: {courseError}</div>
          ) : courseList.length > 0 ? (
            <div className="border rounded-lg divide-y divide-gray-200">
              {courseList.map((course) => (
                <div key={course.course_id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {course.content_type === 'VIDEO' ? <PlayCircle size={18} className="text-gray-400" /> : <FileText size={18} className="text-gray-400" />}
                    <span className="text-gray-700 text-sm">{course.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{course.duration}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-gray-500 text-sm">준비된 교육 자료가 없습니다.</div>
          )}
        </div>

        <div className="w-full md:w-80 bg-slate-50 border-l border-gray-200 p-6 flex flex-col shrink-0 overflow-y-auto max-h-[80vh]">
            <div className="bg-white border border-gray-200 p-1 mb-6 shadow-sm">
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-5xl">
                    {item.image_url || "📦"}
                </div>
            </div>
            
            <div className="text-3xl font-bold text-slate-900 mb-4">
                무료 <span className="text-base font-normal text-gray-500">대여</span>
            </div>

            {item.available_qty > 0 ? (
                <form onSubmit={(e) => { e.preventDefault(); onRent({...item, startDate, endDate, reason}); }} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">대여 시작일</label>
                        <input type="date" required className="w-full p-2 border text-sm" value={startDate} onChange={e=>setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">반납 예정일</label>
                        <input type="date" required className="w-full p-2 border text-sm" value={endDate} onChange={e=>setEndDate(e.target.value)} />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-600 mb-1">신청 사유</label>
                        <textarea className="w-full p-2 border text-sm" rows={2} required value={reason} onChange={e=>setReason(e.target.value)}></textarea>
                    </div>
                    <button className="w-full py-3 bg-purple-600 text-white font-bold text-lg hover:bg-purple-700 shadow-lg transition-all">
                        대여 신청하기
                    </button>
                </form>
            ) : (
                 <button disabled className="w-full py-3 bg-gray-300 text-gray-500 font-bold text-lg cursor-not-allowed">
                    현재 대여 불가
                </button>
            )}
            <button onClick={onClose} className="mt-4 w-full py-2 border border-slate-900 text-slate-900 font-bold hover:bg-gray-50">
                닫기
            </button>
        </div>
      </div>
    </div>
  );
}