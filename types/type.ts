export type DataPayload = {
  email?: string;
  password?: string;
  username?: string;
  last_name?: string;
  first_name?: string;
  password_confirmation?: string;
};

export type User = {
  name?: string;
  email?: string;
  phone_number?: string;
  access_token?: string;
};

export type SessionData = {
  user: User | string | null;
  isLoggedIn: boolean;
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

export type RequestOptions = {
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | Date>;
};

export type RequestType = {
  endpoint: string;
  method: "POST" | "PATCH" | "GET" | "PUT" | "DELETE";
  options?: RequestOptions;
};

export type LoginResponse = {
  message?: string;
  data: {
    name?: string;
    email?: string;
    phone_number?: string;
    access_token?: string;
  };
};

