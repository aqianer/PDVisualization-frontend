import axios from 'axios'

const API_URL = 'http://localhost:8000'

const authApi = {
  async login(username, password) {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    
    const response = await axios.post(`${API_URL}/login`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async register(userData) {
    const response = await axios.post(`${API_URL}/register`, userData)
    return response.data
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  }
}

export default authApi 