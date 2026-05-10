class AuthManager {
  constructor() {
    this.apiUrl = 'http://localhost:3000';
    this.userKey = 'agriconnect_current_user';
  }

  async signup(name, email, password, type) {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, type }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Unable to reach backend server.' };
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem(this.userKey, JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return { success: false, message: 'Unable to reach backend server.' };
    }
  }

  getCurrentUser() {
    const stored = localStorage.getItem(this.userKey);
    return stored ? JSON.parse(stored) : null;
  }

  logout() {
    localStorage.removeItem(this.userKey);
  }
}

const auth = new AuthManager();
