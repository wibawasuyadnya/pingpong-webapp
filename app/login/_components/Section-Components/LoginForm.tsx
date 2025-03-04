"use client";
import { useRouter } from "next/navigation";
import { LoginResponse } from "@/types/type";
import React, { useEffect, useState } from "react";
import { api } from "@/helper/external-api/apiClient";
import getHeader from "@/lib/getHeader";
import { useUser } from "@/lib/useUser";
import { AxiosError } from "axios";

type FormDataProps = {
    phone: string;
    password: string;
};

type ApiResponse = LoginResponse;

export default function Section() {
    const [formData, setFormData] = useState<FormDataProps>({
        phone: "",
        password: "",
    });
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const isValid =
            formData.phone.trim() !== "" &&
            formData.password.trim() !== ""
        setIsFormValid(isValid);
    }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedValue = value;
        setFormData((prevData) => ({ ...prevData, [name]: updatedValue }));
    };

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const headers = await getHeader({});
        const body = {
            phone_number: formData.phone,
            password: formData.password
        }

        try {
            const res = await api<ApiResponse>({
                endpoint: "/api/auth/login",
                method: "POST",
                options: {
                    body: body,
                    headers: headers,
                },
            });

            console.log(res);

            await useUser({
                name: res.data.name,
                email: res.data.email,
                phone_number: res.data.phone_number,
                access_token: res.data.access_token,
            });

            setLoading(false);
            router.push("/");
        } catch (error) {
            setLoading(false);
            if (error instanceof AxiosError) {
                const errorMessage =
                    error.response?.data?.message || "An unexpected error occurred";
                if (error.response?.status === 403) {
                    setErrors({ message: [errorMessage] });
                } else {
                    setErrors({ message: ["An unexpected error occurred. Please try again."] });
                }
            } else {
                setErrors({
                    message: [
                        "A network error occurred. Please check your connection and try again.",
                    ],
                });
            }
        }

    };

    return (
        <div className="w-1/3 ml-[-230px]">
            <div className="mb-5">
                <h1 className="font-bold text-[22px] leading-5 text-center text-white">Login</h1>
            </div>
            <form onSubmit={handleLogin}>
                <div className="space-y-3">
                    <div className="w-full">
                        <label className="label label-text text-white"> Phone Number </label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <span className="icon-[emojione-v1--flag-for-united-kingdom] size-5"></span>
                            </span>
                            <input 
                                type="text" 
                                className="input grow h-10" 
                                placeholder="phone number" 
                                value={formData.phone}
                                id="phone-number" 
                                name="phone"
                                onChange={handleInputChange} 
                                required />
                        </div>
                    </div>
                    <div className="w-full">
                        <label className="label label-text text-white" htmlFor="toggle-password"> Password </label>
                        <div className="input-group">
                            <input 
                                id="toggle-password" 
                                type="password" 
                                name="password"
                                className="input grow h-10" 
                                placeholder="Enter password" 
                                value={formData.password} 
                                onChange={handleInputChange} />
                            <span className="input-group-text">
                                <button type="button" data-toggle-password='{ "target": "#toggle-password" }' className="block" aria-label="password toggle">
                                    <span className="icon-[tabler--eye] text-base-content/80 password-active:block hidden size-5 flex-shrink-0"></span>
                                    <span className="icon-[tabler--eye-off] text-base-content/80 password-active:hidden block size-5 flex-shrink-0" ></span>
                                </button>
                            </span>
                        </div>
                    </div>
                    <div className="pt-5">
                        <button className="text-white bg-primary w-full rounded-md py-2" type="submit">Login</button>
                    </div>
                </div>
            </form>
        </div>
    )
}