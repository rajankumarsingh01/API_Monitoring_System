import config from "../config/index.js";
import ResponseFormatter from "../utils/responseFormatter.js";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js"

/**
 * Middleware to authenticate requests using JWT.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
const authenticate = async (req, res, next) => {
    try {
        let token = null;

        if (req.cookies && req.cookies.authToken) {
            token = req.cookies.authToken
        }

        if (!token) {
            return res.status(401).json(ResponseFormatter.error("Authentication token is required", 401))
        }

        const decoded = jwt.verify(token, config.jwt.secret);

        const { userId, email, username, role, clientId } = decoded;

        req.user = {
            userId, email, username, role, clientId
        }

        next()
    } catch (error) {
        logger.error("Authentication failed", {
            error: error.message,
            path: req.path
        });

        if (error.name === 'TokenExpiredError') {
            return res
                .status(401)
                .json(ResponseFormatter.error('Token expired', 401));
        }

        return res
            .status(401)
            .json(ResponseFormatter.error('Invalid token', 401));
    }
}

export default authenticate











/*
=============================================================================
AUTHENTICATION MIDDLEWARE (JWT)
=============================================================================

Purpose:
Check karta hai user login hai ya nahi.

Flow:

Request
   ↓
Cookie se JWT Token
   ↓
Token Verify
   ↓
req.user Set
   ↓
next()

-----------------------------------------------------------------------------

1. Cookie Se Token

req.cookies.authToken

Login ke baad jo JWT cookie me save hua tha usko nikalta hai.

-----------------------------------------------------------------------------

2. Token Missing

Agar token nahi mila:

401 Unauthorized

"Authentication token is required"

-----------------------------------------------------------------------------

3. JWT Verify

jwt.verify(token, config.jwt.secret)

Check karta hai:

✔ Token valid hai?
✔ Token modify nahi hua?
✔ Token expire nahi hua?

-----------------------------------------------------------------------------

4. req.user

Token se user data nikal kar:

req.user = {
   userId,
   email,
   username,
   role,
   clientId
}

save karta hai.

Ab next middleware aur controller user ko access kar sakte hain.

-----------------------------------------------------------------------------

5. Token Expired

401 Unauthorized

"Token expired"

-----------------------------------------------------------------------------

6. Invalid Token

401 Unauthorized

"Invalid token"

=============================================================================
INTERVIEW ANSWER
=============================================================================

Ye JWT authentication middleware hai jo cookie se token verify karta hai,
user information req.user me store karta hai aur protected routes ko
sirf authenticated users ke liye accessible banata hai.

=============================================================================
*/