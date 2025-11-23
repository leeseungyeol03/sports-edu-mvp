import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../App';
import { ArrowLeft, MessageCircle, PlayCircle, FileText, X } from 'lucide-react';
import { apiClient } from '../api/client';
import ChatWindow from '../components/ChatWindow';

export default function Classroom({ rental, onExit }) {
  console.log('Classroom received rental:', rental); // Added log
  const { user } = useContext(UserContext); // Get user from context
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rental) return;
    const equipId = rental.equipment?.equip_id;
    if (!equipId) {
      setLoading(false);
      return;
    }

    const fetchCurriculum = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/api/courses/?equip_id=${equipId}`);
        setCourses(data);
        if (data.length > 0) setActiveCourse(data[0]);
      } catch (err) {
        console.error("커리큘럼 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [rental]);

  const instructorId = rental?.equipment?.instructor_id;

  if (!rental) return <div className="flex h-screen items-center justify-center">강의실 입장 중...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onExit}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="내 학습으로 돌아가기"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-100">
              {rental.equipment?.name || "강의실"}
            </h1>
            <p className="text-xs text-gray-400">수강 기한: {new Date(rental.end_date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <button 
          onClick={() => instructorId && setIsChatOpen(true)}
          disabled={!instructorId}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          <MessageCircle size={18} />
          1:1 멘토링 채팅
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col bg-black relative items-center justify-center overflow-y-auto">
          {activeCourse ? (
            <div className="w-full max-w-5xl aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-700 flex flex-col items-center justify-center p-4">
              {activeCourse.content_type === 'VIDEO' ? (
                 <iframe width="100%" height="100%" src={activeCourse.content_url.replace("watch?v=", "embed/")} title={activeCourse.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              ) : (
                <div className="text-center">
                  <FileText size={64} className="mx-auto mb-4 text-blue-400 opacity-80" />
                  <h2 className="text-xl font-bold mb-2">{activeCourse.title}</h2>
                  <a href={activeCourse.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">PDF 자료 다운로드</a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">
              {loading ? "강의 로딩 중..." : "등록된 강의 콘텐츠가 없습니다."}
            </div>
          )}
        </main>

        <aside className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-700 font-bold text-gray-200">
            강의 목차
          </div>
          <div className="flex-1 overflow-y-auto">
            {courses.length > 0 ? (
              <ul className="divide-y divide-gray-700">
                {courses.map((course, idx) => (
                  <li 
                    key={course.course_id || idx}
                    onClick={() => setActiveCourse(course)}
                    className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors flex items-start gap-3 ${
                      activeCourse?.course_id === course.course_id ? 'bg-gray-700 border-l-4 border-purple-500' : ''
                    }`}
                  >
                    <div className="mt-1">
                      {course.content_type === 'VIDEO' ? <PlayCircle size={16} /> : <FileText size={16} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-200 mb-1">{course.title}</h4>
                      <span className="text-xs text-gray-500">{course.duration || "시간 정보 없음"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500 text-sm">
                등록된 강의가 없습니다.<br/>관리자에게 문의하세요.
              </div>
            )}
          </div>
        </aside>
      </div>

      {isChatOpen && user && instructorId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg h-[70vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <ChatWindow 
              rentalId={rental.rental_id}
              userId={user.user_id} 
              onClose={() => setIsChatOpen(false)}
            /> 
          </div>
        </div>
      )}
    </div>
  );
}