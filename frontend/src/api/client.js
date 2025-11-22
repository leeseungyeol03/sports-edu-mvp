const BASE_URL = import.meta.env.VITE_API_URL || '';

// 로컬 스토리지에서 토큰 가져오기
const getToken = () => localStorage.getItem('access_token');

// 기본 요청 함수
const request = async (method, endpoint, body = null, contentType = 'application/json') => {
  const token = getToken();
  const headers = {};

  // 토큰이 있으면 자동으로 Authorization 헤더 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // FormData는 브라우저가 Content-Type을 자동으로 설정하므로 헤더에서 제거
  if (body instanceof FormData) {
    // Content-Type 헤더를 설정하지 않음
  } else if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    if (contentType === 'application/json' && !(body instanceof FormData)) {
      config.body = JSON.stringify(body);
    } else if (contentType === 'application/x-www-form-urlencoded' && body instanceof URLSearchParams) {
      config.body = body.toString();
    } else {
      config.body = body; // FormData 또는 기타 타입
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // 응답이 성공적이지 않으면 에러 던짐
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: '응답을 파싱할 수 없습니다.' }));
      let errorMessage = errorData.detail;
      // FastAPI validation error handling
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.map(e => `${e.loc.join('.')}: ${e.msg}`).join('; ');
      }
      const error = new Error(errorMessage || 'API 요청 중 오류가 발생했습니다.');
      error.response = response; // Attach response to error object
      error.data = errorData;
      throw error;
    }

    // 204 No Content 또는 내용 없는 응답 처리
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {};
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error.data || error.message);
    throw error;
  }
};

// 메서드별 단축 함수 내보내기
export const apiClient = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, body, contentType = 'application/json') => request('POST', endpoint, body, contentType),
  put: (endpoint, body, contentType = 'application/json') => request('PUT', endpoint, body, contentType),
  delete: (endpoint) => request('DELETE', endpoint),
};

// New API calls for user management
export const updateUser = (userData) => apiClient.put('/api/users/me', userData);
export const updatePassword = (passwordData) => apiClient.put('/api/users/me/password', passwordData);

// New API calls for courses
export const createCourseAdmin = (courseData) => apiClient.post('/api/courses/', courseData);
export const fetchMyCourses = () => apiClient.get('/api/courses/my');

// New API calls for chat
export const fetchChatHistory = (otherUserId) => apiClient.get(`/api/chat/history/${otherUserId}`);
export const fetchChatRoomsAdmin = () => apiClient.get('/api/chat/rooms');

// New API calls for signup
export const signupUser = (userData) => apiClient.post('/api/users/signup', userData);