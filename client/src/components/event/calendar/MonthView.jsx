import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isWithinInterval } from 'date-fns';
import UserAvatar from '../../common/UserAvatar';
import { useUsers } from '../../../hooks/useUsers';

function MonthView({ days, event, attendeesByDay }) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    // Get all days in the month(s) that contain the event
    const monthStart = startOfMonth(startDate);
    const monthEnd = endOfMonth(endDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get unique userIds from all attendees
    const userIds = Object.values(attendeesByDay).reduce((acc, { arriving, departing }) => {
        const dayUserIds = [...arriving, ...departing].map(a => a.userId);
        return [...new Set([...acc, ...dayUserIds])];
    }, []);

    const { users } = useUsers(userIds);

    const renderAttendeeAvatars = (attendees, limit = 3) => {
        if (!attendees?.length) return null;
        
        const showingAttendees = attendees.slice(0, limit);
        const remaining = attendees.length - limit;

        return (
            <div className="flex -space-x-1 overflow-hidden">
                {showingAttendees.map(attendee => (
                    <UserAvatar
                        key={attendee.userId}
                        userId={attendee.userId}
                        name={users[attendee.userId]?.firstName}
                        size="xs"
                    />
                ))}
                {remaining > 0 && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-medium">
                        +{remaining}
                    </div>
                )}
            </div>
        );
    };

    const renderAttendeeInfo = (day) => {
        const dayInfo = attendeesByDay[day.toISOString()];
        if (!dayInfo) return null;

        return (
            <div className="mt-2 space-y-2">
                {dayInfo.arriving.length > 0 && (
                    <div>
                        <div className="text-xs text-green-600 mb-1">Arriving</div>
                        {renderAttendeeAvatars(dayInfo.arriving)}
                    </div>
                )}
                {dayInfo.departing.length > 0 && (
                    <div>
                        <div className="text-xs text-red-600 mb-1">Departing</div>
                        {renderAttendeeAvatars(dayInfo.departing)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
                
                {calendarDays.map(day => {
                    const isEventDay = isWithinInterval(day, { start: startDate, end: endDate });
                    const isCurrentMonth = isSameMonth(day, startDate);
                    const dayInfo = attendeesByDay[day.toISOString()];
                    const hasActivity = dayInfo && (
                        dayInfo.arriving.length > 0 || 
                        dayInfo.departing.length > 0
                    );
                    
                    return (
                        <div
                            key={day.toISOString()}
                            className={`
                                p-2 min-h-[80px] border border-gray-100
                                ${isEventDay ? 'bg-blue-50' : ''}
                                ${!isCurrentMonth ? 'text-gray-300' : ''}
                                ${hasActivity ? 'ring-2 ring-blue-200' : ''}
                            `}
                        >
                            <div className="text-right text-sm">{format(day, 'd')}</div>
                            {renderAttendeeInfo(day)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default MonthView; 