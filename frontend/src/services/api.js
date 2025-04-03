import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const userService = {
  login: async (credentials) => {
    const response = await api.post("/login/", credentials);
    return response.data;
  },

  uploadDocument: async (formData) => {
    const response = await api.post("/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get("/users/");
    return response.data;
  },

  getFaculty: async () => {
    const response = await api.get("/faculty/");
    return response.data;
  },

  getStudents: async () => {
    const response = await api.get("/students/");
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  createFaculty: async (facultyData) => {
    const response = await api.post("/faculty/", facultyData);
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await api.post("/students/", studentData);
    return response.data;
  },
};

export default api;
