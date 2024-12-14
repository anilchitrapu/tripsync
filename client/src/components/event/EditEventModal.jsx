import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import Modal from '../common/Modal';

function EditEventModal({ event, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        eventName: event.eventName,
        startDate: format(parseISO(event.startDate), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(parseISO(event.endDate), "yyyy-MM-dd'T'HH:mm"),
        location: event.location || '',
        description: event.description || '',
        acceptingSubmissions: event.acceptingSubmissions
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const updatedEvent = {
            ...formData,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
            location: formData.location.trim(),
            description: formData.description.trim(),
            acceptingSubmissions: formData.acceptingSubmissions
        };

        try {
            await onSave(updatedEvent);
            onClose();
        } catch (error) {
            console.error('Error in modal save:', error);
            alert('Failed to save changes. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Event">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Event Name
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 
                                 dark:focus:border-blue-400 shadow-sm"
                        value={formData.eventName}
                        onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            eventName: e.target.value 
                        }))}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Start Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                     focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 
                                     dark:focus:border-blue-400 shadow-sm"
                            value={formData.startDate}
                            onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                startDate: e.target.value 
                            }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            End Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                     focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 
                                     dark:focus:border-blue-400 shadow-sm"
                            value={formData.endDate}
                            onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                endDate: e.target.value 
                            }))}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 
                                 dark:focus:border-blue-400 shadow-sm"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: e.target.value
                        }))}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                    </label>
                    <textarea
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 
                                 dark:focus:border-blue-400 shadow-sm min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            description: e.target.value
                        }))}
                    />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white 
                                 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="button button-primary dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white
                                 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default EditEventModal; 