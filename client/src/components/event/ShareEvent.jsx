import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function ShareEvent({ event }) {
    const [copied, setCopied] = useState(false);
    const location = useLocation();
    
    // Get the full URL for sharing
    const shareUrl = `${window.location.origin}${location.pathname}`;
    
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: `Join me for ${event.title}!`,
                    url: shareUrl
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleCopyLink}
                className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                {copied ? 'Copied!' : 'Copy Link'}
            </button>

            {navigator.share && (
                <button
                    onClick={handleShare}
                    className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Share
                </button>
            )}
        </div>
    );
}

export default ShareEvent; 