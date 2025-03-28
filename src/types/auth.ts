
export interface AuthenticationResponse {
  token: string;
  authenticated: boolean;
}

export interface TokenPayload {
  iss: string
  sub: string
  exp: number
  iat: number
  jti: string
  scope: string
}
