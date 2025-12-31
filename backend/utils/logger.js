
const getTimestamp = () => new Date().toISOString();

const formatLog = (level, message, meta = {}) => {
    return JSON.stringify({
        level,
        timestamp: getTimestamp(),
        message,
        ...meta,
        environment: process.env.NODE_ENV || 'development'
    });
};

export const logger = {
    info: (message, meta) => console.log(formatLog('INFO', message, meta)),
    error: (message, meta) => console.error(formatLog('ERROR', message, meta)),
    warn: (message, meta) => console.warn(formatLog('WARN', message, meta)),
    debug: (message, meta) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(formatLog('DEBUG', message, meta));
        }
    }
};
