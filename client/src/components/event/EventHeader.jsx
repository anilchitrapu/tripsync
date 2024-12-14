import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import EditEventModal from './EditEventModal';
import ShareEvent from './ShareEvent';

function EventHeader({ event, isOwner, onSave }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleSave = async (updatedEvent) => {
        await onSave(updatedEvent);
        setIsEditModalOpen(false);
    };

    const toggleEventStatus = async () => {
        const updatedEvent = {
            ...event,
            acceptingSubmissions: !event.acceptingSubmissions
        };
        await onSave(updatedEvent);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                            {event.eventName}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                            event.acceptingSubmissions 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                            {event.acceptingSubmissions ? 'Accepting Submissions' : 'Submissions Closed'}
                        </span>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        <p>Start: {format(parseISO(event.startDate), 'PPP p')}</p>
                        <p>End: {format(parseISO(event.endDate), 'PPP p')}</p>
                        {event.location && (
                            <p className="flex items-center gap-2 break-words">
                                <svg 
                                    className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                    <circle cx="12" cy="9" r="2.5" />
                                </svg>
                                <span>{event.location}</span>
                            </p>
                        )}
                    </div>
                    {event.description && (
                        <div className="mt-3">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm sm:text-base">
                                {event.description}
                            </p>
                        </div>
                    )}
                </div>

                {isOwner && (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <ShareEvent event={event} />
                    </div>
                )}
            </div>

            {isOwner && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white 
                                 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <span>Edit Event</span>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button 
                        onClick={toggleEventStatus}
                        className={`button button-secondary flex items-center justify-center gap-2 w-full sm:w-auto ${
                            event.acceptingSubmissions 
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800' 
                                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                        }`}
                    >
                        <span>{event.acceptingSubmissions ? 'Close Submissions' : 'Accept Submissions'}</span>
                    </button>
                </div>
            )}

            <EditEventModal
                event={event}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}

export default EventHeader; 