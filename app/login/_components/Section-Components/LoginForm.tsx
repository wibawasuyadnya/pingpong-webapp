"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Section() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, password }),
        });

        const data = await res.json();

        if (data.success) {
            document.cookie = "isAuthenticated=true; path=/";
            router.push('/');
        } else {
            alert(data.message);
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
                            <input type="text" className="input grow h-10" placeholder="phone number" value={phone}
                                id="leadingIconDefault" onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                    </div>
                    <div className="w-full">
                        <label className="label label-text text-white" htmlFor="toggle-password"> Password </label>
                        <div className="input-group">
                            <input id="toggle-password" type="password" className="input grow h-10" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <span className="input-group-text">
                                <button type="button" data-toggle-password='{ "target": "#toggle-password" }' className="block" aria-label="password toggle">
                                    <span className="icon-[tabler--eye] text-base-content/80 password-active:block hidden size-5 flex-shrink-0"></span>
                                    <span className="icon-[tabler--eye-off] text-base-content/80 password-active:hidden block size-5 flex-shrink-0" ></span>
                                </button>
                            </span>
                        </div>
                    </div>
                    <div className="pt-5">
                        <button className="text-white bg-[#ACACAC] w-full rounded-md py-2" type="submit">Login</button>
                    </div>
                </div>
            </form>
        </div>
    )
}