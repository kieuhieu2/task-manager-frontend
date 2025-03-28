import { jwtDecode} from 'jwt-decode'
import type { TokenPayload } from '@/types/auth.js'

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwtDecode<TokenPayload>(token)
  } catch (error) {
    console.error('Lỗi khi giải mã token:', error)
    return null
  }
}
