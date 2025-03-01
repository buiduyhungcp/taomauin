const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

// Tạo server HTTP để tích hợp Socket.IO
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

// Khi kết nối, người dùng (client) sẽ "join" vào room theo user id
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId.toString());
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });
});

// Cấu hình kết nối MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // thay bằng mật khẩu của bạn nếu có
  database: 'thukhen'
});

connection.connect((err) => {
  if (err) {
    console.error('Kết nối MySQL thất bại:', err);
    return;
  }
  console.log('Kết nối MySQL thành công.');
});

// Helper: generate a random session token
const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username và password bắt buộc' });
  }
  const sql = 'SELECT * FROM user WHERE username = ?';
  connection.query(sql, [username], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Username không tồn tại' });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password không đúng' });
    }
    // Tạo session token mới
    const newToken = generateSessionToken();
    const updateSql = 'UPDATE user SET session_token = ? WHERE id = ?';
    connection.query(updateSql, [newToken, user.id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({ error: 'Lỗi hệ thống' });
      }
      user.session_token = newToken;
      io.to(user.id.toString()).emit('forceLogout', { message: "Đã đăng nhập từ một thiết bị khác" });
      res.json({ message: 'Đăng nhập thành công', user });
    });
  });
});

app.post('/api/register', async (req, res) => {
  const { username, password, phone, email, address, fullName } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username và password bắt buộc' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO user (username, password, phone, email, address, fullName) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [username, hashedPassword, phone, email, address, fullName], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Đăng ký thất bại' });
      }
      res.json({ message: 'Đăng ký thành công', userId: result.insertId });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

app.get('/api/categories', (req, res) => {
  const sql = 'SELECT * FROM category WHERE cat_show = 1 ORDER BY cat_home, id';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn danh mục:", err);
      return res.status(500).json({ error: "Lỗi hệ thống" });
    }
    res.json(results);
  });
});

// Endpoint để lấy templates theo danh mục (cat_id)
app.get('/api/templates', (req, res) => {
  const cat_id = req.query.cat_id;
  if (!cat_id) {
    return res.status(400).json({ error: 'cat_id is required' });
  }
  const sql = 'SELECT * FROM templates WHERE cat_id = ? AND template_show = 1 ORDER BY id';
  connection.query(sql, [cat_id], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn templates:", err);
      return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
    res.json(results);
  });
});

// Sử dụng server thay vì app.listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server chạy trên cổng ${PORT}`);
});
