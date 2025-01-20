module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'], // Các phần mở rộng file cần xử lý
  rootDir: '.', // Thư mục gốc (mặc định là thư mục chứa file jest.config.js)
  testRegex: '.*\\.spec\\.ts$', // Chỉ kiểm tra các file có đuôi .spec.ts
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest', // Sử dụng ts-jest để biên dịch TypeScript
  },
  collectCoverage: true, // Thu thập thông tin coverage
  coverageDirectory: './coverage', // Thư mục chứa báo cáo coverage
  testEnvironment: 'node', // Môi trường kiểm thử
};
