class CSRFServiceClass {
  private tokenKey = 'csrf_token'

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token)
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey)
  }
}

export const CSRFService = new CSRFServiceClass() 