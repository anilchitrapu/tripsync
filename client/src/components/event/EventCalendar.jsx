import React, { useMemo } from 'react';
import {
    differenceInDays,
    eachDayOfInterval,
    format,
    parseISO,
    addDays,
    subDays,
    isBefore,
    isAfter,
    startOfDay,
    endOfDay
} from 'date-fns';
import { useEventAttendance } from '../../hooks/useEventAttendance';
import { useUsers } from '../../hooks/useUsers';
import PropTypes from 'prop-types';

function EventCalendar({ event, className = '' }) {
    if (!event) {
        return null;
    }

    const { attendees, loading: attendeesLoading } = useEventAttendance(event.id);
    const { users } = useUsers();

    const {
        daysArray,
        attendeesByDay
    } = useMemo(() => {
        // Extend range to include one day before and after
        const extendedStart = subDays(new Date(event.startDate), 1);
        const extendedEnd = addDays(new Date(event.endDate), 1);

        // Generate array of days including buffer days
        const daysArray = eachDayOfInterval({ 
            start: extendedStart, 
            end: extendedEnd 
        });

        // Group attendees by day
        const attendeesByDay = daysArray.reduce((acc, day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            
            const arriving = attendees.filter(a => {
                const arrivalDate = parseISO(a.arrival);
                return format(arrivalDate, 'yyyy-MM-dd') === dayStr;
            }).map(a => {
                const user = users.find(u => u.id === a.userId);
                return {
                    ...a,
                    time: format(parseISO(a.arrival), 'h:mm a'),
                    transport: a.arrivalTransport,
                    name: user?.firstName || 'Guest'
                };
            });

            const departing = attendees.filter(a => {
                const departureDate = parseISO(a.departure);
                return format(departureDate, 'yyyy-MM-dd') === dayStr;
            }).map(a => {
                const user = users.find(u => u.id === a.userId);
                return {
                    ...a,
                    time: format(parseISO(a.departure), 'h:mm a'),
                    transport: a.departureTransport,
                    name: user?.firstName || 'Guest'
                };
            });

            acc[dayStr] = { arriving, departing };
            return acc;
        }, {});

        return { daysArray, attendeesByDay };
    }, [event, attendees, users]);

    const renderTransportIcon = (transport) => {
        switch (transport) {
            case 'plane':
                return '✈️';
            case 'car':
                return '🚗';
            case 'train':
                return '🚂';
            case 'bus':
                return '🚌';
            default:
                return '🚶';
        }
    };

    const renderDay = (day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayData = attendeesByDay[dayStr] || { arriving: [], departing: [] };
        
        // Check if this is an event day or buffer day
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const isBeforeEvent = isBefore(endOfDay(day), eventStart);
        const isAfterEvent = isAfter(startOfDay(day), eventEnd);
        const isEventDay = !isBeforeEvent && !isAfterEvent;

        return (
            <div key={dayStr} className={`
                border-b last:border-b-0 py-4 px-4
                ${isEventDay ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800/50'}
            `}>
                <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                        {format(day, 'EEEE, MMMM d')}
                    </span>
                    {(!isEventDay) && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                            {isBeforeEvent ? 'Pre-event' : 'Post-event'}
                        </span>
                    )}
                </div>
                
                {dayData.arriving.length > 0 && (
                    <div className="mb-3">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Arriving:</div>
                        {dayData.arriving.map((person, idx) => (
                            <div key={`arrival-${idx}`} className="text-sm pl-4 flex items-center gap-2">
                                <span>{renderTransportIcon(person.transport)}</span>
                                <span className="font-medium text-gray-900 dark:text-white">{person.name}</span>
                                <span className="text-gray-500 dark:text-gray-400">at {person.time}</span>
                            </div>
                        ))}
                    </div>
                )}

                {dayData.departing.length > 0 && (
                    <div>
                        <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Departing:</div>
                        {dayData.departing.map((person, idx) => (
                            <div key={`departure-${idx}`} className="text-sm pl-4 flex items-center gap-2">
                                <span>{renderTransportIcon(person.transport)}</span>
                                <span className="font-medium text-gray-900 dark:text-white">{person.name}</span>
                                <span className="text-gray-500 dark:text-gray-400">at {person.time}</span>
                            </div>
                        ))}
                    </div>
                )}

                {dayData.arriving.length === 0 && dayData.departing.length === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 pl-4">
                        No scheduled arrivals or departures
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={className}>
            {attendeesLoading ? (
                <div className="text-center py-4 text-gray-600 dark:text-gray-400">Loading schedule...</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
                    {daysArray.map(day => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const dayData = attendeesByDay[dayStr] || { arriving: [], departing: [] };
                        const eventStart = new Date(event.startDate);
                        const eventEnd = new Date(event.endDate);
                        const isBeforeEvent = isBefore(endOfDay(day), eventStart);
                        const isAfterEvent = isAfter(startOfDay(day), eventEnd);
                        const isEventDay = !isBeforeEvent && !isAfterEvent;

                        return (
                            <div key={dayStr} className={`
                                border-b last:border-b-0 py-4 px-4
                                ${isEventDay ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800/50'}
                            `}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {format(day, 'EEEE, MMMM d')}
                                    </span>
                                    {(!isEventDay) && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                                            {isBeforeEvent ? 'Pre-event' : 'Post-event'}
                                        </span>
                                    )}
                                </div>
                                
                                {dayData.arriving.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Arriving:</div>
                                        {dayData.arriving.map((person, idx) => (
                                            <div key={`arrival-${idx}`} className="text-sm pl-4 flex items-center gap-2">
                                                <span>{renderTransportIcon(person.transport)}</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{person.name}</span>
                                                <span className="text-gray-500 dark:text-gray-400">at {person.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {dayData.departing.length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Departing:</div>
                                        {dayData.departing.map((person, idx) => (
                                            <div key={`departure-${idx}`} className="text-sm pl-4 flex items-center gap-2">
                                                <span>{renderTransportIcon(person.transport)}</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{person.name}</span>
                                                <span className="text-gray-500 dark:text-gray-400">at {person.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {dayData.arriving.length === 0 && dayData.departing.length === 0 && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 pl-4">
                                        No scheduled arrivals or departures
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

EventCalendar.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.string.isRequired,
        startDate: PropTypes.string.isRequired,
        endDate: PropTypes.string.isRequired
    }).isRequired,
    className: PropTypes.string
};

export default React.memo(EventCalendar);