"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateThemeFromLocalStorage } from "@/redux/slices/globalSlice";

const ThemeInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateThemeFromLocalStorage());
  }, [dispatch]);

  return null;
};

export default ThemeInitializer;
