import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ACCESS_KEY = 'access';
export const Access = () => SetMetadata(ACCESS_KEY, true);
