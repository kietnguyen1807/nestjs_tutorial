import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { sendRequest } from "./utils/api";
import Password from "antd/es/input/Password";
import { IUser } from "./types/next-auth";
import { notification } from "antd";
import {
  EmailExists,
  InActiveAccountError,
  InvalidPasswordError,
} from "./utils/errors";
// Your own logic for dealing with plaintext password strings; be careful!

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const res = await sendRequest<IBackendRes<ILogin>>({
          method: "POST",
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`,
          body: {
            email: credentials.email,
            password: credentials.password,
          },
        });
        if ((await res).statusCode === 200) {
          return {
            firstName: (await res).data?.user.firstName,
            lastName: (await res).data?.user.lastName,
            email: (await res).data?.user.email,
            access_token: (await res).data?.access_token,
          };
        } else if ((await res).statusCode === 401) {
          throw new InvalidPasswordError();
        } else if ((await res).statusCode === 400) {
          throw new EmailExists();
        } else if ((await res).statusCode === 403) {
          throw new InActiveAccountError();
        } else {
          throw new Error("Internal server error");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.user = user as IUser;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as IUser) = token.user;
      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
});
