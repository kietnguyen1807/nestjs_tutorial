import { AuthError } from "next-auth";

export class CustomError extends AuthError {
  static type: string;

  constructor(message?: any) {
    super();

    this.type = message;
  }
}

export class InvalidPasswordError extends AuthError {
  static type = "Password not correct";
}

export class InActiveAccountError extends AuthError {
  static type = "Account not active";
}

export class EmailExists extends AuthError {
  static type = "Email already exists";
}
