export interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
  date_joined: string
}

export interface HealthResponse {
  status: string
  message: string
}