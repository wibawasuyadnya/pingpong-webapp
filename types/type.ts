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
  picture: string | undefined;
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
    picture?: string;
  };
};

export type Video = {
  id: string;
  thread_name: string;
  title: string;
  user: {
    id: string;
    name: string;
    picture: string;
  },
  video_url: string;
  hls_url: string;
  thumbnail_url: string;
  created_at: string;
  is_favorite: boolean;
  is_reply_video: boolean;
  is_front_camera: boolean;
  is_from_gallery: boolean;
  is_draft: boolean;
  is_own_video: boolean;
  is_thread_owner_video: boolean;
  has_srt: boolean;
  srt_file: string;
  total_comment: number;
  duration: string;
  my_emoji_reaction: string;
  my_watch_duration: string;
  is_reminder_active: boolean;
  has_reminders: boolean;
}


