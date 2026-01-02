export function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export function toUp(string){
    return String(string).charAt(0).toUpperCase() + String(string).slice(1);
}