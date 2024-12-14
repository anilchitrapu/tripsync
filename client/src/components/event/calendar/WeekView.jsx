import React, { useState } from 'react';
import { format, isToday } from 'date-fns';
import UserAvatar from '../../common/UserAvatar';
import { useUsers } from '../../../hooks/useUsers';

function WeekView({ days, event, hasGaps, attendeesByDay }) {
    const [expandedDays, setExpandedDays] = useState([]);
    
    const userIds = Object.values(attendeesByDay).reduce((acc, { arriving, departing }) => {
        const dayUserIds = [...arriving, ...departing].map(a => a.userId);
        return [...new Set([...acc, ...dayUserIds])];
    }, []);

    const { users, loading } = useUsers(userIds);

    const getTransportIcon = (mode) => {
        switch (mode) {
            case 'car': return '🚗';
            case 'plane': return '✈️';
            case 'train': return '🚂';
            default: return '🚶';
        }
    };

    const renderDayContent = (day) => {
        const dayString = day.toISOString();
        const dayInfo = attendeesByDay[dayString];

        if (!dayInfo) return null;

        return (
            <div className="space-y-4">
                {dayInfo.arriving.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-green-600 mb-2">
                            Arriving
                        </div>
                        {dayInfo.arriving.map(person => (
                            <div key={person.userId} className="flex items-center gap-3">
                                <UserAvatar 
                                    userId={person.userId}
                                    name={users[person.userId]?.firstName}
                                    size="sm"
                                />
                                <span className="text-sm font-medium flex-1">
                                    {users[person.userId]?.firstName || 'Guest'}
                                </span>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-sm">
                                        {format(new Date(person.arrivalDate), 'h:mm a')}
                                    </span>
                                    <span>{getTransportIcon(person.arrivalTransport)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {dayInfo.departing.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-red-600 mb-2">
                            Departing
                        </div>
                        {dayInfo.departing.map(person => (
                            <div key={person.userId} className="flex items-center gap-3">
                                <UserAvatar 
                                    userId={person.userId}
                                    name={users[person.userId]?.firstName}
                                    size="sm"
                                />
                                <span className="text-sm font-medium flex-1">
                                    {users[person.userId]?.firstName || 'Guest'}
                                </span>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-sm">
                                        {format(new Date(person.departureDate), 'h:mm a')}
                                    </span>
                                    <span>{getTransportIcon(person.departureTransport)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    console.log('Debug:', {
        attendeesByDay,
        userIds,
        users
    });

    return (
        <div className="space-y-4">
            {days.map(day => (
                <div 
                    key={day.toISOString()} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                    <h3 className="text-lg font-medium mb-4">
                        {format(day, 'EEEE, MMMM d')}
                    </h3>
                    {renderDayContent(day)}
                </div>
            ))}
        </div>
    );
}

export default WeekView; 