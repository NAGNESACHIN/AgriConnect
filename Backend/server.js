const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const getUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }

  try {
    const json = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(json);
  } catch (error) {
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
};

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, type } = req.body;
  if (!name || !email || !password || !type) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const users = getUsers();
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return res.json({ success: false, message: 'Email already registered.' });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    type,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return res.json({
    success: true,
    message: 'Account created successfully.',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, type: newUser.type },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const users = getUsers();
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (!user) {
    return res.json({ success: false, message: 'Email or password is incorrect.' });
  }

  return res.json({
    success: true,
    message: 'Login successful.',
    user: { id: user.id, name: user.name, email: user.email, type: user.type },
  });
});

app.get('/api/auth/profile', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const users = getUsers();
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, type: user.type } });
});

app.listen(PORT, () => {
  console.log(`AgriConnect backend running on http://localhost:${PORT}`);
});
