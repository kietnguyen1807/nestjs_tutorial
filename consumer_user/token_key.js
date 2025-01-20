const jwt = require('jsonwebtoken');

// Payload của token (có thể chứa thông tin người dùng)
const payload = {
  sub: 123, // Ví dụ về user ID
  email: 'admin@example.com',
};

// Secret key dùng để mã hóa token
const secretKey = 'serect';

// Tạo token không có thời gian hết hạn
const token = jwt.sign(payload, secretKey, {
  expiresIn: '0', // '0' có nghĩa là token không có thời gian hết hạn
});

console.log('Generated token:', token);
