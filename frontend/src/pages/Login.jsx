import React, { useState } from 'react';
import { apiClient } from '../api/client';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [adminCode, setAdminCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignup) {
      try {
        await apiClient.post('/users/signup', {
          username, password, name, affiliation, 
          admin_code: adminCode 
        });
        alert("회원가입 성공! 로그인해주세요.");
        setIsSignup(false);
      } catch (error) {
        alert("가입 실패: " + error.message);
      }
    } else {
      onLogin(username, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            {isSignup ? "회원가입" : "로그인"}
          </h2>
          <p className="mt-2 text-gray-600">SportsEdu 계정으로 {isSignup ? "시작하기" : "계속하기"}</p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            {isSignup && (
              <>
                <input type="text" placeholder="이름 (실명)" required className="w-full p-3 border rounded text-sm" value={name} onChange={e => setName(e.target.value)} />
                <input type="text" placeholder="소속 (학교/기관명)" required className="w-full p-3 border rounded text-sm" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
              </>
            )}
            <input type="text" placeholder="아이디 (username)" required className="w-full p-3 border rounded text-sm" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="비밀번호" required className="w-full p-3 border rounded text-sm" value={password} onChange={e => setPassword(e.target.value)} />
            {isSignup && (
              <div className="pt-2 border-t mt-4">
                <label className="text-xs text-gray-500 mb-1 block">관리자 코드 (선택)</label>
                <input type="text" placeholder="관리자 코드" className="w-full p-3 border bg-purple-50 rounded text-sm" value={adminCode} onChange={e => setAdminCode(e.target.value)} />
              </div>
            )}
          </div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded shadow-sm">
            {isSignup ? "가입하기" : "로그인"}
          </button>
        </form>
        <div className="text-center text-sm">
          <button onClick={() => setIsSignup(!isSignup)} className="font-bold text-purple-600 hover:text-purple-500">
            {isSignup ? "로그인으로 돌아가기" : "회원가입하기"}
          </button>
        </div>
      </div>
    </div>
  );
}