import logger from "../config/logger.js"
import ResponseFormatter from "../utils/ResponseFormatter.js"

// Agent
const errorHandler = (err, req, res, next) => {

       console.log('FULL ERROR:', err);  // ← ye add karo
    console.log('ERROR NAME:', err.name);
    console.log('ERROR MESSAGE:', err.message);

   let statusCode = err.statusCode || 500;  // ✅
    let message = err.message || "Internal server error";
    let errors = err.errors || null


    logger.error('Error occurred:', {
        message: err.message,
        statusCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        errors = Object.values(err.errors).map((e) => e.message)
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate key error';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    };

    res.status(statusCode).json(ResponseFormatter.error(message, statusCode, errors))
}

export default errorHandler;















/*
=============================================================================
GLOBAL ERROR HANDLER MIDDLEWARE
=============================================================================

Purpose:
Poore application me aane wale errors ko ek hi jagah handle karna.

Ye Express ka last middleware hota hai.

Flow:

Request
   ↓
Route / Controller
   ↓
Error Aaya ?
   ↓ YES
errorHandler
   ↓
Proper Response

=============================================================================
ERROR HANDLER PARAMETERS
=============================================================================

(err, req, res, next)

err  -> Actual error object
req  -> Request object
res  -> Response object
next -> Next middleware

Express error middleware ki pehchan:

4 parameters hote hain.

=============================================================================
DEBUG LOGS
=============================================================================

console.log()

Development ke time full error dekhne ke liye.

Print karta hai:

FULL ERROR
ERROR NAME
ERROR MESSAGE

Example:

ValidationError

Duplicate Key Error

JWT Error

=============================================================================
DEFAULT ERROR VALUES
=============================================================================

statusCode = err.statusCode || 500

Agar custom status code nahi mila:

500 Internal Server Error

-----------------------------------------------------------------------------

message = err.message || "Internal server error"

Agar custom message nahi mila:

Internal server error

-----------------------------------------------------------------------------

errors = err.errors || null

Additional error details.

=============================================================================
LOGGER
=============================================================================

logger.error()

Error ko permanently logs me save karta hai.

Store karta hai:

✔ Error Message

✔ Status Code

✔ Stack Trace

✔ Request Path

✔ HTTP Method

Ye production debugging ke liye bahut important hai.

=============================================================================
MONGOOSE VALIDATION ERROR
=============================================================================

Example:

Username required tha

User ne nahi bheja

↓

ValidationError

-----------------------------------------------------------------------------

Response:

400 Bad Request

-----------------------------------------------------------------------------

Object.values(err.errors)

Har field ka validation message nikalta hai.

Example:

[
  "Username is required",
  "Email is invalid"
]

=============================================================================
DUPLICATE KEY ERROR
=============================================================================

MongoDB Error Code:

11000

-----------------------------------------------------------------------------

Example:

Email already exist karta hai.

User phir same email se register kar raha hai.

↓

Duplicate Key Error

-----------------------------------------------------------------------------

Response:

409 Conflict

Message:

Duplicate key error

=============================================================================
JWT ERROR
=============================================================================

JsonWebTokenError

-----------------------------------------------------------------------------

Example:

Fake Token

Wrong Token

Modified Token

-----------------------------------------------------------------------------

Response:

401 Unauthorized

Message:

Invalid token

=============================================================================
TOKEN EXPIRED ERROR
=============================================================================

TokenExpiredError

-----------------------------------------------------------------------------

Example:

JWT expire ho gaya.

-----------------------------------------------------------------------------

Response:

401 Unauthorized

Message:

Token expired

=============================================================================
FINAL RESPONSE
=============================================================================

ResponseFormatter.error()

Har error ko standard format me return karta hai.

Example:

{
   success:false,
   message:"Validation Error",
   statusCode:400,
   errors:[
      "Email is required"
   ]
}

=============================================================================
WHY GLOBAL ERROR HANDLER IMPORTANT?
=============================================================================

Without Error Handler:

Error
 ↓
Server Crash

-----------------------------------------------------------------------------

With Error Handler:

Error
 ↓
Catch
 ↓
Log
 ↓
Proper Response
 ↓
Server Continue Running

=============================================================================
EXAMPLE FLOW
=============================================================================

POST /register

↓

Email Already Exists

↓

MongoDB Error

↓

errorHandler

↓

409 Conflict

{
   success:false,
   message:"Duplicate key error"
}

=============================================================================
INTERVIEW ANSWER
=============================================================================

Ye global error handling middleware hai jo application ke sabhi runtime,
validation, database aur authentication errors ko centralize karke
proper HTTP response aur logging provide karta hai, jisse server crash
hone ke bajay controlled error handling hoti hai.

=============================================================================
IMPORTANT CONCEPT
=============================================================================

Is project me error handling hierarchy:

Route
 ↓
Service
 ↓
Repository
 ↓
throw Error
 ↓
errorHandler
 ↓
ResponseFormatter
 ↓
Client

Matlab poore application ka single source of error handling
ye middleware hai.

=============================================================================
*/