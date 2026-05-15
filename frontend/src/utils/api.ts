import axios from 'axios'

const api = axios.create({ 
  baseURL: '/',
  withCredentials: true 
})

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) return err.response?.data?.detail ?? err.message
  return String(err)
}

export default api
