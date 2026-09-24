import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin
)

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
