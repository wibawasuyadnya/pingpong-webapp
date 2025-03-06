// app/[id_video]/_components/Section-Components/VideoFeed-Components/UploadButton.tsx
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react'; // Importing X icon from lucide-react
import React, { Fragment, useState } from 'react';
import Image from 'next/image';

export default function UploadButton({ activeId }: { activeId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    // Animation variants for the main button (swipe down)
    const mainButtonVariants = {
        initial: { y: 0, opacity: 1, scale: 1 },
        hidden: { y: 50, opacity: 0, scale: 0.8, transition: { duration: 0.3, ease: 'easeIn' } },
        visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    };

    // Animation variants for the child buttons (appear from below)
    const childButtonVariants = {
        hidden: { y: 50, opacity: 0, scale: 0.8 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: 'easeOut' },
        },
    };

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <div className="fixed bottom-3 left-[57.5%] transform -translate-x-1/2 z-20 flex items-center gap-4">
            {/* Child Buttons (visible when main button is clicked) */}
            {isOpen && (
                <Fragment>
                    {/* Upload Button */}
                    <motion.div
                        variants={childButtonVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <Link href="/upload">
                            <button className="w-fit h-12 bg-purple-600 px-2 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 transition-colors">
                                <span className="icon-[material-symbols--add] size-7" />
                                <p className='font-bold text-white px-5'>New</p>
                            </button>
                        </Link>
                    </motion.div>

                    {/* Cancel Button (X) */}
                    <motion.div
                        variants={childButtonVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <button
                            onClick={handleToggle}
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </motion.div>

                    {/* Upload with Video ID Button */}
                    <motion.div
                        variants={childButtonVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <Link href={`/upload?reply_video=${activeId}`}>
                            <button className="w-fit h-12 bg-[linear-gradient(241.5deg,_#F31816_14.53%,_#F3168D_74.01%)] px-2 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[linear-gradient(241.5deg,_#F31816_14.53%,_#F3168D_74.01%)] transition-colors">
                                <span className="icon-[ic--baseline-reply] size-7" />
                                <p className='font-bold text-white px-5'>Reply</p>
                            </button>
                        </Link>
                    </motion.div>
                </Fragment>
            )}

            {/* Main Circular Button */}
            <motion.button
                variants={mainButtonVariants}
                initial="initial"
                animate={isOpen ? 'hidden' : 'visible'}
                onClick={handleToggle}
                className={`${isOpen ? "hidden" : ""} w-fit h-fit bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 transition-colors`}
            >
                <Image src={'/icon_addvideo.png'} alt="image icon add button" width={50} height={50} />
            </motion.button>
        </div>
    );
}