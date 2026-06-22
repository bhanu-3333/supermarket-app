import axios from 'axios';

// Change this based on your environment:
// For web: 'http://localhost:5000/api'
// For mobile on same network: 'http://YOUR_IP:5000/api'
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

export default api;
