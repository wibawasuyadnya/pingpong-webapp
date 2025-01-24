"use client";
import { useEffect } from "react";
import { RootState } from "@/redux/store";
import { useAppSelector } from "@/redux/hook";

interface ThemeWrapperProps {
    children: React.ReactNode;
}

const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
    const theme = useAppSelector((state: RootState) => state.global.theme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme || "");
    }, [theme]);

    return <div data-theme={theme}>{children}</div>;
};

export default ThemeWrapper;
