import { User as UserType } from './user.types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserType;
  }
}

export {};
