import { jwtDecode } from "jwt-decode";

const API_URL = 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  picture?: string;
  access_token: string;
}

export const loginWithGoogle = async (): Promise<User> => {
  // Redirect to backend's Google OAuth endpoint
  window.location.href = `${API_URL}/login`;
  // This will redirect to Google, then to our callback, and then to the frontend with tokens
  return new Promise(() => {});
};

export const handleAuthCallback = async (): Promise<User | null> => {
  console.log("still frontend control")
  // This should be called after the redirect from OAuth
  try {
    const response = await fetch(`${API_URL}/auth/google/callback${window.location.search}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to authenticate with Google');
    }
    
    const data = await response.json();
    console.log(data)
    // Store the token in session storage
    if (data.access_token) {
      sessionStorage.setItem('access_token', data.access_token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      return { ...data.user, access_token: data.access_token };
    }
    
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  const user = sessionStorage.getItem('user');
  const token = sessionStorage.getItem('access_token');
  
  if (!user || !token) return null;
  
  try {
    const parsedUser = JSON.parse(user);
    // Verify token is not expired
    const decoded: any = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      logout();
      return null;
    }
    
    return { ...parsedUser, access_token: token };
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const logout = (): void => {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user');
  // Optionally redirect to login page
  window.location.href = '/';
};

export const getAuthHeaders = (): HeadersInit => {
  const token = sessionStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};
