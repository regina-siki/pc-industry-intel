import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000,
})

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('[api]', err?.message || err)
    return Promise.reject(err)
  },
)

export default http
