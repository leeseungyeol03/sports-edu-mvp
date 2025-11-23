import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../App'; // Assuming UserContext is defined in App.jsx
import { apiClient, updateUser, updatePassword } from '../api/client';

const MyPage = () => {
  const { user, setUser } = useContext(UserContext);
  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAffiliation(user.affiliation || '');
    }
  }, [user]);

  const fetchUserMe = async () => {
    try {
      const userData = await apiClient.get('/api/users/me');
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('사용자 정보를 가져오는 데 실패했습니다.');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const updatedUser = await updateUser({ name, affiliation });
      setUser(updatedUser);
      setMessage('프로필 정보가 성공적으로 업데이트되었습니다.');
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.message || '프로필 정보 업데이트에 실패했습니다.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmNewPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!currentPassword || !newPassword) {
      setError('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      await updatePassword({ current_password: currentPassword, new_password: newPassword });
      setMessage('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error('Password change failed:', err);
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">마이페이지</h2>
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">마이페이지</h2>

      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      {/* 사용자 정보 */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">내 정보</h3>
        <p className="mb-2"><span className="font-medium text-gray-600">아이디:</span> {user.username}</p>
        <p className="mb-2"><span className="font-medium text-gray-600">이름:</span> {user.name || '미입력'}</p>
        <p className="mb-2"><span className="font-medium text-gray-600">소속:</span> {user.affiliation || '미입력'}</p>
        <p className="mb-2"><span className="font-medium text-gray-600">권한:</span> {user.role}</p>
      </div>

      {/* 정보 수정 폼 */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">프로필 정보 수정</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700">소속</label>
            <input
              type="text"
              id="affiliation"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            정보 수정
          </button>
        </form>
      </div>

      {/* 비밀번호 변경 폼 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">비밀번호 변경</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmNewPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            비밀번호 변경
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyPage;