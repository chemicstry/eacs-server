import { transports, createLogger } from 'winston';

const Log = createLogger({
    transports: [
        new transports.Console({
            level: 'debug'
        }),
    ]
});

export {
    Log
};
