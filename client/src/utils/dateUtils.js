export const formatDateTime = (dateString) => {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

export const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
}; 