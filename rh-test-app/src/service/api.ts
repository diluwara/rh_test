import axiosInstance from "./axiosInstance";

export const getUsers = async () => {
  const response = await axiosInstance.get("/users");
  return response.data;
};

export const createUser = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/users", userData);
  return response.data;
};

export const getUser = async (id: number) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (
  id: number,
  userData: { username?: string; email?: string; password?: string }
) => {
  const response = await axiosInstance.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

export const getTasks = async () => {
  const response = await axiosInstance.get("/tasks");
  return response.data;
};

export const createTask = async (taskData: {
  title: string;
  description?: string;
  user_id: number;
}) => {
  const response = await axiosInstance.post("/tasks", taskData);
  return response.data;
};

export const getTask = async (id: number) => {
  const response = await axiosInstance.get(`/tasks/${id}`);
  return response.data;
};

export const updateTask = async (
  id: number,
  taskData: { title?: string; description?: string; completed?: boolean }
) => {
  const response = await axiosInstance.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id: number) => {
  const response = await axiosInstance.delete(`/tasks/${id}`);
  return response.data;
};
