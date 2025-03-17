"use client";

import React from "react";
import { motion } from "framer-motion";

interface FlippingCircleLoaderProps {
    size?: number | string;
    color?: string;
    duration?: number;
}

const FlippingCircleLoader: React.FC<FlippingCircleLoaderProps> = ({
    size = 24,
    color = "blue",
    duration = 2,
}) => {
    return (
        <motion.span
            className="icon-[octicon--dot-fill-16]"
            style={{
                fontSize: size,
                color,
                display: "inline-block",
                transformStyle: "preserve-3d",
                transformOrigin: "50% 50%",
            }}
            animate={{
                rotateY: [0, 180, 180, 0, 0],
                rotateX: [0, 0, 180, 180, 0],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.25, 0.5, 0.75, 1],
            }}
        />
    );
};

export default FlippingCircleLoader;
