import 'express-session';

declare module 'express-session' {
interface Session {
  userid: any;
  useridTopass: any;
  username: string;
  code: any;
  }
}