'use client';
import React, { useState, useEffect } from 'react';
import {
    createInstance,
    RecordingType,
    SDKButtonInterface,
    LoomVideo
} from '@loomhq/record-sdk';

export default function Recording() {
    const [recording, setRecording] = useState<SDKButtonInterface | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        const initializeLoomRecording = async () => {
            try {
                // Setup Loom SDK 
                const loomInstance = await createInstance({
                    mode: 'standard',
                    publicAppId: 'ad000ce6-b5c4-4b66-a782-eea63b4ba667',
                    config: {
                        allowedRecordingTypes: [RecordingType.ScreenAndCamera],
                        defaultRecordingType: RecordingType.ScreenAndCamera
                    }
                });

                // Configure the button separately
                const button = loomInstance.configureButton({
                    hooks: {
                        onRecordingComplete: (video: LoomVideo) => {
                            setVideoUrl(video.sharedUrl);
                        },
                        onComplete: () => {
                            console.log('Recording completed');
                        },
                        onUploadComplete: function (a: LoomVideo): void {
                            throw new Error('Function not implemented.');
                        }
                    }
                });

                setRecording(button);
            } catch (error) {
                console.error('Loom SDK initialization error:', error);
            }
        };

        initializeLoomRecording();
    }, []);

    const startRecording = () => {
        recording?.openPreRecordPanel();
    };

    const stopRecording = () => {
        recording?.endRecording();
    };

    return (
        <div className="bg-white rounded-md h-[500px] p-5">
            <h1 className="text-primary text-3xl font-bold">Home Page</h1>
            <div className="p-2">
                <p>User Name: <b>null</b></p>
                <p>Email: <b>null</b></p>
                <p>Session id: <b>null</b></p>
            </div>

            <div className='flex flex-row gap-2 justify-start items-start w-fit'>
                <button
                    onClick={startRecording}
                    className="bg-primary text-white px-5 py-3 rounded font-semibold text-lg w-fit mx-auto"
                >
                    Screen Capture
                </button>
                <button
                    className="bg-primary text-white px-5 py-3 rounded font-semibold text-lg w-fit mx-auto"
                    onClick={stopRecording}
                >
                    Stop Recording
                </button>
            </div>

            {videoUrl && (
                <div>
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                        View Recorded Video
                    </a>
                </div>
            )}
        </div>
    );
}