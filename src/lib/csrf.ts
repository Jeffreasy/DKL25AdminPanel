// Generate en valideer CSRF tokens
export class CSRFService {
  private static TOKEN_KEY = 'csrf_token'

  // Genereer een random token
  static generateToken(): string {
    const buffer = new Uint8Array(32)
    crypto.getRandomValues(buffer)
    const token = Array.from(buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Sla token op in localStorage
    localStorage.setItem(this.TOKEN_KEY, token)
    return token
  }

  // Valideer een token
  static validateToken(token: string): boolean {
    const storedToken = localStorage.getItem(this.TOKEN_KEY)
    return token === storedToken
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  // Clear token
  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY)
  }
} 