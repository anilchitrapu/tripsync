import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

function UnauthorizedEventView({ event }) {
    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="bg-white p-8 rounded-lg shadow-sm">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">Group Trip</h1>
                        <div className="text-gray-600">
                            <p>{format(parseISO(event.startDate), 'MMMM d')} - {format(parseISO(event.endDate), 'MMMM d, yyyy')}</p>
                            <p className="text-sm">{event.location}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-blue-800">
                                <Link to="/auth" className="text-blue-600 hover:underline">Sign in</Link> to view event details and share your availability
                            </p>
                        </div>

                        <Link 
                            to="/auth" 
                            className="button button-primary inline-flex items-center gap-2"
                        >
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                                />
                            </svg>
                            Sign in to Continue
                        </Link>

                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/auth" className="text-blue-600 hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-xs text-gray-500">
                    TripSync helps groups coordinate their travel schedules easily
                </p>
            </div>
        </div>
    );
}

export default UnauthorizedEventView; 