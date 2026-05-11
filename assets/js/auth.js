class AuthManager {
  constructor() {
    const isBrowserHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    this.apiUrl = isBrowserHttp ? window.location.origin : 'http://localhost:3000';
    this.userKey = 'agriconnect_current_user';
  }

  async signup(name, email, password, type) {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, type }),
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

const getDashboardPath = (type) => {
  return type && type.toLowerCase() === 'farmer' ? 'farmer-dashboard.html' : 'buyer-dashboard.html';
};

const setAuthMessage = (form, message, isSuccess = false) => {
  const messageElement = form.querySelector('[data-auth-message]');
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.toggle('success', isSuccess);
};

const setButtonLoading = (button, isLoading, loadingText) => {
  if (!button) {
    return;
  }

  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.innerHTML;
  }

  button.disabled = isLoading;
  button.innerHTML = isLoading ? loadingText : button.dataset.defaultText;
};

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('[data-auth-form="login"]');
  const signupForm = document.querySelector('[data-auth-form="signup"]');
  const logoutLinks = document.querySelectorAll('[data-logout]');
  const protectedPage = document.body.dataset.requiresAuth === 'true';
  const currentUser = auth.getCurrentUser();

  if (protectedPage && !currentUser) {
    window.location.href = 'login.html';
    return;
  }

  document.querySelectorAll('[data-user-name]').forEach((element) => {
    element.textContent = currentUser ? currentUser.name : '';
  });

  logoutLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      auth.logout();
      window.location.href = 'login.html';
    });
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const email = loginForm.elements.email.value.trim();
      const password = loginForm.elements.password.value;

      setButtonLoading(submitButton, true, 'Logging in...');
      setAuthMessage(loginForm, '');

      const result = await auth.login(email, password);
      if (!result.success) {
        setAuthMessage(loginForm, result.message || 'Login failed.');
        setButtonLoading(submitButton, false);
        return;
      }

      setAuthMessage(loginForm, 'Login successful. Redirecting...', true);
      window.location.href = getDashboardPath(result.user.type);
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = signupForm.querySelector('button[type="submit"]');
      const name = signupForm.elements.name.value.trim();
      const email = signupForm.elements.email.value.trim();
      const type = signupForm.elements.type.value;
      const password = signupForm.elements.password.value;
      const confirmPassword = signupForm.elements.confirmPassword.value;

      setAuthMessage(signupForm, '');

      if (password !== confirmPassword) {
        setAuthMessage(signupForm, 'Passwords do not match.');
        return;
      }

      setButtonLoading(submitButton, true, 'Creating account...');
      const result = await auth.signup(name, email, password, type);
      if (!result.success) {
        setAuthMessage(signupForm, result.message || 'Signup failed.');
        setButtonLoading(submitButton, false);
        return;
      }

      setAuthMessage(signupForm, 'Account created. Redirecting...', true);
      window.location.href = getDashboardPath(result.user.type);
    });
  }
});
