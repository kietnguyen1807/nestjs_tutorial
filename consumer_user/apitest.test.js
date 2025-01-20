const supertest = require('supertest');
const request = supertest('http://localhost:3000/');

(async () => {
  try {
    // Gửi request GET đến endpoint /account
    const response = await request.get('account');
    console.log(response.body);
  } catch (error) {
    console.error('Error fetching users:', error.message);
  }
})();
