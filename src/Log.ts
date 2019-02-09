import * as winston from 'winston';

const Log = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug'
        }),
    ]
});

export {
    Log
};
