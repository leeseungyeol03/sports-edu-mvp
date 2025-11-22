import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell } from 'lucide-react'; // Removed Heart icon

export default function Navbar({ user, onLogout, setView }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16 flex items-center shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center h-full">
        <div className="flex items-center gap-6">
          <div 
            className="text-2xl font-bold text-slate-900 cursor-pointer flex items-center gap-1" 
            onClick={() => setView('catalog')}
          >
            <span className="text-purple-600">Sports</span>Edu
          </div>
          <button className="hidden md:flex items-center text-sm text-gray-600 hover:text-purple-600 font-medium">
            카테고리
          </button>
        </div>

        <div className="flex-1 max-w-2xl mx-6 hidden sm:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-900 rounded-full text-sm bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-0 focus:bg-white focus:border-purple-600 transition-colors"
              placeholder="어떤 종목을 찾고 계신가요?"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {user.role !== 'ADMIN' && ( // Conditional rendering for "내 학습(대여)"
                <button 
                  className="hidden md:block text-sm font-medium text-gray-600 hover:text-purple-600"
                  onClick={() => setView('my-rentals')}
                >
                  내 학습(대여)
                </button>
              )}
              <button className="text-gray-600 hover:text-purple-600"><Bell size={20} /></button>
              
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs cursor-pointer" 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user.name ? user.name[0] : 'U'}
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <button
                      onClick={() => { setView('mypage'); setIsDropdownOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      마이페이지
                    </button>
                    <button
                      onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setView('login')} className="text-sm font-bold border border-slate-900 px-4 py-2 text-slate-900 hover:bg-gray-50">로그인</button>
              <button onClick={() => setView('login')} className="text-sm font-bold bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">회원가입</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}