import { userService } from './userService'
import { healthService } from './healthService'

export const apiService = {
  user: userService,
  health: healthService,
}