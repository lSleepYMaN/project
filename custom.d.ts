import 'express-session';

declare module 'express-session' {
interface Session {
  userid: any;
  username: string;
  code: any;
  }
}