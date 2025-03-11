import React from "react";

export default function Footer() {
    return (
        <div className="w-full flex flex-row justify-between items-center pt-12 pb-2 px-6">
            <div className="flex flex-row w-fit gap-5 text-white">
                <span className="text-sm font-normal"><a href="#">Company</a> </span>
                <span className="text-sm font-normal"><a href="#">Terms & Conditions</a> </span>
                <span className="text-sm font-normal"><a href="#">Privacy policy</a> </span>
            </div>

            <span className="text-sm font-semibold text-white">Copyright - Pingpong.pro - {(new Date().getFullYear())}</span>
        </div>
    )
}