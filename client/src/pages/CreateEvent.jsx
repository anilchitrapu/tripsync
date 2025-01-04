import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

function CreateEvent() {
    const { user } = useAuth();
    const [eventName, setEventName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [acceptingSubmissions, setAcceptingSubmissions] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [eventId, setEventId] = useState('');

    // Set min date to today
    const today = new Date();
    today.setMinutes(Math.ceil(today.getMinutes() / 30) * 30); // Round to next 30 min
    const minDate = today.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm

    // Update end date min when start date changes
    useEffect(() => {
        if (startDate && (!endDate || new Date(endDate) < new Date(startDate))) {
            setEndDate(startDate);
        }
    }, [startDate]);

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        
        // If end date is before new start date, update it
        if (endDate && new Date(endDate) < new Date(newStartDate)) {
            setEndDate(newStartDate);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            const eventData = {
                eventName,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                location,
                description,
                acceptingSubmissions,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            if (process.env.NODE_ENV === 'development') {
                console.log('Creating event with data:', eventData);
            }
            
            const docRef = await addDoc(collection(db, 'events'), eventData);
            setEventId(docRef.id);
            setIsSuccess(true);
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-6 sm:py-8">
            <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
                    Create an Event
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label className="form-label text-gray-700 dark:text-gray-300">Event Name</label>
                        <input
                            type="text"
                            className="form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="Enter event name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label text-gray-700 dark:text-gray-300">
                            Location <span className="text-gray-500 dark:text-gray-400 text-sm">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            className="form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter location"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label text-gray-700 dark:text-gray-300">Start Date & Time</label>
                        <div className="flex gap-2">
                            <input
                                type="datetime-local"
                                className="form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                value={startDate}
                                onChange={handleStartDateChange}
                                min={minDate}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label text-gray-700 dark:text-gray-300">End Date & Time</label>
                        <div className="flex gap-2">
                            <input
                                type="datetime-local"
                                className="form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || minDate}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label text-gray-700 dark:text-gray-300">Description (Optional)</label>
                        <textarea
                            className="form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter event description"
                            rows="4"
                        />
                    </div>

                    <div className="checkbox-group mb-6">
                        <input
                            type="checkbox"
                            id="acceptingSubmissions"
                            checked={acceptingSubmissions}
                            onChange={(e) => setAcceptingSubmissions(e.target.checked)}
                            className="mr-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="acceptingSubmissions" className="text-gray-700 dark:text-gray-300">
                            Accepting Submissions
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="button button-primary dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white
                                   w-full sm:w-auto"
                    >
                        Create Event
                    </button>

                    {isSuccess && (
                        <div className="success-message mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <p className="text-green-800 dark:text-green-200">Event created successfully!</p>
                            <p className="mt-2 text-green-700 dark:text-green-300">Share this link with your friends:</p>
                            <a
                                href={`${window.location.origin}/event/${eventId}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {`${window.location.origin}/event/${eventId}`}
                            </a>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default CreateEvent;