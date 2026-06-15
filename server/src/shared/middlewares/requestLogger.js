import logger from '../config/logger.js';

/**
 * Request logger middleware - centralizes request logging.
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP %s %s %s %dms', req.method, req.originalUrl || req.url, req.ip || req.socket.remoteAddress, duration, {
            method: req.method,
            path: req.originalUrl || req.url,
            status: res.statusCode,
            duration,
        });
    });

    next();
};

export default requestLogger;











/*
=============================================================================
REQUEST LOGGER MIDDLEWARE
=============================================================================

Purpose:
Har incoming HTTP request ka log maintain karna.

Ye monitoring, debugging aur analytics ke liye use hota hai.

Flow:

Request
   ↓
Request Logger
   ↓
Controller / Route
   ↓
Response
   ↓
Log Save

-----------------------------------------------------------------------------

start = Date.now()

Request aate hi current timestamp save kar leta hai.

Purpose:

Response aane me kitna time laga ye calculate karna.

-----------------------------------------------------------------------------

res.on("finish")

Ye event tab trigger hota hai jab response client ko successfully
send ho jata hai.

Matlab:

Request complete ho chuki hai.

-----------------------------------------------------------------------------

duration

const duration = Date.now() - start

Response complete hone me kitne milliseconds lage.

Example:

Start:
10:00:00

Finish:
10:00:01

Duration:
1000ms

-----------------------------------------------------------------------------

logger.info(...)

Request ki important information log karta hai.

Store Karta Hai:

Method:
GET / POST / PUT / DELETE

Path:
/api/auth/login

IP Address:
192.168.1.10

Status Code:
200 / 404 / 500

Duration:
125ms

-----------------------------------------------------------------------------

Example Log

HTTP POST /api/auth/login 192.168.1.10 125ms

{
   method: "POST",
   path: "/api/auth/login",
   status: 200,
   duration: 125
}

-----------------------------------------------------------------------------

next()

Request ko next middleware ya controller tak bhej deta hai.

Agar next() nahi chalega to request wahi ruk jayegi.

=============================================================================
WHY IMPORTANT IN MONITORING SYSTEM?
=============================================================================

Ye middleware future me help karega:

✔ Slow APIs identify karne me

✔ Error requests track karne me

✔ Traffic analysis me

✔ Audit logs me

✔ Performance monitoring me

=============================================================================
INTERVIEW ANSWER
=============================================================================

Ye middleware har HTTP request ka execution time, status code,
request path aur client information log karta hai jisse debugging,
monitoring aur performance analysis kiya ja sake.
=============================================================================
*/