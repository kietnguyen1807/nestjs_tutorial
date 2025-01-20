import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const storage_image = diskStorage({
  destination: './uploads_image', // Thư mục lưu trữ file
  filename: (req, file, callback) => {
    const isValid = isValidFilename(file.originalname);
    if (!isValid) {
      return callback(new BadRequestException('Invalid file name.'), null);
    }
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

export const storage_file = diskStorage({
  destination: './uploads_file', // Thư mục lưu trữ file
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

export function isValidFilename(filename: string): boolean {
  const validCharactersRegex = /^[a-zA-Z0-9_\-\.]+$/;

  const maxFilenameLength = 255;

  if (!validCharactersRegex.test(filename)) {
    return false;
  }
  if (filename.length > maxFilenameLength) {
    return false;
  }

  return true;
}
