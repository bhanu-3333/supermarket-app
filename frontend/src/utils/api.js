import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.100:5000/api', // Change to your machine's local IP
  timeout: 10000,
});

export default api;
