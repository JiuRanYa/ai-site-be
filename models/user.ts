/**
 * 用户模型定义
 */

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // 存储时加密，返回时不包含
  fullName?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// 创建用户时的数据结构
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: 'admin' | 'user';
}

// 更新用户时的数据结构
export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
  role?: 'admin' | 'user';
}

// 用户登录时的数据结构
export interface LoginData {
  username: string;
  password: string;
}

// 登录响应数据结构
export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
} 