"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import "flag-icons/css/flag-icons.min.css";
import { api } from "@/helper/external-api/apiClient";
import getHeader from "@/lib/getHeader";
import { useUser } from "@/lib/useUser";
import Select, { components, StylesConfig } from "react-select";
import { Eye, EyeClosed } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const countryCodes = require("country-codes-list");

const myCountryCodesObject: Record<string, string> = countryCodes.customList(
    "countryCode",
    "+{countryCallingCode}"
);

const countryNames: Record<string, string> = countryCodes.customList(
    "countryCode",
    "{countryNameEn}"
);

interface LoginResponse {
    data: {
        name: string;
        email: string;
        phone_number: string;
        access_token: string;
        picture?: string;
    };
}

type FormDataProps = {
    phone: string;
    password: string;
};

export default function LoginSection() {
    const router = useRouter();
    const [submit, SetSubmit] = useState<boolean>(false)
    const [flagCode, setFlagCode] = useState<string>("gb");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormDataProps>({ phone: "44", password: "" });
    const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string; phoneCode: string } | null>(null);

    const isFormValid = formData.phone.trim() !== "" && formData.password.trim() !== "";

    const countryOptions = Object.entries(myCountryCodesObject).map(([iso, phoneCode]) => ({
        value: iso.toLowerCase(),
        label: `${countryNames[iso]} (${phoneCode})`,
        phoneCode: phoneCode.slice(1),
    }));
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomOption = (props: any) => {
        const { data } = props;
        return (
            <components.Option {...props}>
                <div className="flex items-center rounded-lg p-2">
                    <span className={`fi fi-${data.value} mr-2`} style={{ fontSize: "1rem" }} />
                    <span>{data.label}</span>
                </div>
            </components.Option>
        );
    };

    const customStyles: StylesConfig = {
        control: (provided) => ({
            ...provided,
            borderRadius: "0.5rem",
            border: "solid #B14AE2 1px",
            boxShadow: "none",
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "0.5rem",
            marginTop: "0.5rem",
            background: "white",
            border: "solid #B14AE2 1px",
            height: "fit-content",
            maxHeight: 300,
            overflowY: "hidden",
            padding: "5px 3px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#3b82f6"
                : state.isFocused
                    ? "#e2e8f0"
                    : "white",
            color: state.isSelected ? "white" : "black",
            padding: "5px",
            borderRadius: "0.25rem",
        }),
    };

    // Reverse mapping from phone code to ISO code with prioritization
    const getIsoFromPhoneCode = (phoneCode: string): string => {
        let iso = "";
        for (let len = 1; len <= 3 && len <= phoneCode.length; len++) {
            const codeSlice = phoneCode.slice(0, len);
            const countries = Object.entries(myCountryCodesObject).filter(
                ([_, code]) => code === `+${codeSlice}`
            );
            if (countries.length > 0) {
                if (codeSlice === "44") {
                    const gbCountry = countries.find(([code]) => code.toLowerCase() === "gb");
                    iso = gbCountry ? "gb" : countries[0][0].toLowerCase();
                } else if (codeSlice === "1") {
                    const usCountry = countries.find(([code]) => code.toLowerCase() === "us");
                    iso = usCountry ? "us" : countries[0][0].toLowerCase();
                } else {
                    iso = countries[0][0].toLowerCase();
                }
                break;
            }
        }
        return iso || "gb";
    };

    // Geolocation on mount
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const response = await fetch(
                            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
                        );
                        const data = await response.json();
                        const isoCode = data.countryCode.toLowerCase();
                        const phoneCodeEntry = myCountryCodesObject[isoCode.toUpperCase()];
                        if (phoneCodeEntry) {
                            const phoneCode = phoneCodeEntry.slice(1);
                            setFlagCode(isoCode);
                            setFormData((prev) => ({ ...prev, phone: phoneCode }));
                            setSelectedCountry({
                                value: isoCode,
                                label: phoneCodeEntry,
                                phoneCode,
                            });
                        } else {
                            console.error(`No phone code found for ISO code: ${isoCode}`);
                        }
                    } catch (err) {
                        console.error("Error determining location:", err);
                    }
                },
                (err) => {
                    console.error("Geolocation error:", err);
                }
            );
        }
    }, []);

    // Update flag and dropdown based on phone input
    useEffect(() => {
        const cleanedPhone = formData.phone.replace(/\D/g, "");
        if (cleanedPhone.length >= 1) {
            const iso = getIsoFromPhoneCode(cleanedPhone);
            if (iso) {
                setFlagCode(iso);
                const country = countryOptions.find((c) => c.value === iso);
                if (country && (!selectedCountry || selectedCountry.value !== iso)) {
                    setSelectedCountry({ value: country.value, label: country.label, phoneCode: country.phoneCode });
                }
            }
        }
    }, [formData.phone]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handle country selection from dropdown
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCountrySelect = (selectedOption: any) => {
        setSelectedCountry(selectedOption);
        setFlagCode(selectedOption.value);
        setFormData((prev) => ({ ...prev, phone: selectedOption.phoneCode }));
        setIsDropdownOpen(false);
    };

    // Open dropdown on flag click
    const openDropdown = () => {
        setIsDropdownOpen(true);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        SetSubmit(true)
        const headers = await getHeader({});
        const body = {
            phone_number: `+${formData.phone}`,
            password: formData.password,
        };

        try {
            const res = await api<LoginResponse>({
                endpoint: "/api/auth/login",
                method: "POST",
                options: { body, headers },
            });

            await useUser({
                name: res.data.name,
                email: res.data.email,
                phone_number: res.data.phone_number,
                access_token: res.data.access_token,
                picture: res.data.picture,
            });
            SetSubmit(false)
            router.push("/");
        } catch (error) {
            console.error("Login error:", error);
            SetSubmit(false)
            setErrorMessage("Invalid phone or password. Please try again.");

        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <h1 className="text-xl font-bold mb-10 text-center text-white">Login</h1>
            <form onSubmit={handleLogin}>
                {/* Phone Number Field */}
                <div className="mb-4">
                    <label className="block font-medium mb-1 text-white">Phone number</label>
                    <div className="flex flex-row gap-3 items-center h-10">
                        <div className="w-fit h-full p-1 flex items-center bg-white rounded-lg relative">
                            <span
                                className={`fi fi-${flagCode || "id"} ml-2 mr-2 rounded-sm shadow-sm cursor-pointer`}
                                style={{ fontSize: "1.25rem" }}
                                onClick={openDropdown}
                            />
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 z-10">
                                    <Select
                                        options={countryOptions}
                                        value={null}
                                        onChange={handleCountrySelect}
                                        menuIsOpen={true}
                                        autoFocus={true}
                                        className="w-48"
                                        classNamePrefix="react-select"
                                        components={{ Option: CustomOption }}
                                        styles={customStyles}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="bg-white rounded-lg overflow-hidden w-full">
                            <input
                                type="tel"
                                name="phone"
                                placeholder="e.g. 123456789"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="flex-grow p-2 outline-none w-full"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Password Field with Show/Hide Toggle */}
                <div className="mb-4 relative">
                    <label className="block font-medium mb-1 text-white">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-white rounded-lg p-2 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <p className="text-red-500 text-sm mt-1 mb-2">
                        {errorMessage}
                    </p>
                )}

                {/* Submit Button with Conditional Styling */}
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${isFormValid
                        ? "bg-gradient-to-b from-[#D241AA] to-[#C42BDD] text-white"
                        : "bg-[#ACACAC] text-gray-300 cursor-not-allowed"
                        }`}
                >
                    {submit ? "Loading" : "Login"}
                </button>
            </form>
        </div>
    );
}