import React from 'react';

const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
};

function UserAvatar({ userId, name, size = 'md' }) {
    const initials = name
        ? name.split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';

    return (
        <div 
            className={`
                ${sizeClasses[size]}
                rounded-full bg-blue-100 text-blue-600 font-medium
                flex items-center justify-center
                flex-shrink-0
            `}
        >
            {initials}
        </div>
    );
}

export default UserAvatar; 