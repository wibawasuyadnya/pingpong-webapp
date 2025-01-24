export type DataPayload = {
  email?: string;
  password?: string;
  username?: string;
  last_name?: string;
  first_name?: string;
  password_confirmation?: string;
};

export type User = {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  access_token?: string;
};

export type SessionData = {
  user: User | string | null;
  isLoggedIn: boolean;
  timerStartTime: number;
};

export type FetcherGetConfig = [
  string,
  Record<string, string>?,
  Record<string, any>?
];

export type FetcherPostConfig = {
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
};
