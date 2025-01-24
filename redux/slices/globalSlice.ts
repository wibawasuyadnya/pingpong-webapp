"use client";
import { Language } from "@/types/enum";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GlobalSliceInitialState {
  loading: boolean;
  theme: string | null;
  language: Language;
  tags: string;
}

const getSystemTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

const initialState: GlobalSliceInitialState = {
  loading: true,
  tags: '',
  theme: null,
  language: (() => {
    if (typeof window !== "undefined") {
      const preferredLanguage = navigator.language.split("-")[0] as Language;
      if (Object.values(Language).includes(preferredLanguage)) {
        return preferredLanguage;
      }
    }
    return Language.ID;
  })(),
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
      }
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setTags: (state, action: PayloadAction<string>) => {
      state.tags = action.payload;
    },
    clearTags: (state) => {
      state.tags = '';
    },
    updateThemeFromLocalStorage: (state) => {
      if (typeof window !== "undefined") {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme) {
          state.theme = storedTheme;
        } else {
          state.theme = getSystemTheme();
        }
      }
    },
  },
});

export const {
  setTags,
  setTheme,
  clearTags,
  setLoading,
  setLanguage,
  updateThemeFromLocalStorage,
} = globalSlice.actions;

export default globalSlice.reducer;