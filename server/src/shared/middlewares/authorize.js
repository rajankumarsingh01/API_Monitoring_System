import ResponseFormatter from "../utils/responseFormatter.js";

/**
 * Middleware to authorize requests based on user roles.
 * @param {Array<string>} allowedRoles - The roles allowed to access the route.
 * @returns {Function} - Returns a middleware function.
 * @throws {Error} - Throws an error if the user is not authorized.
 * This middleware checks if the authenticated user has the necessary role to access the route.
 * If the user does not have the required role, it responds with a 403 Forbidden status.
 * If the user is authorized, it calls the next middleware in the stack.
 */
const authorize = (allowedRoles = []) => (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            return res.status(403).json(ResponseFormatter.error("Forbidden", 403))
        }

        // skip
        if (allowedRoles.length === 0) {
            next()
        };

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json(ResponseFormatter.error("Insufficient permissions", 403))
        }

        next()
    } catch (error) {
        return res.status(403).json(ResponseFormatter.error("Forbidden", 403))
    }
}

export default authorize;
















/*
=============================================================================
AUTHORIZATION MIDDLEWARE (ROLE BASED ACCESS CONTROL - RBAC)
=============================================================================

Purpose:
Check karna ki logged-in user ke paas kisi route ko access karne ki
permission hai ya nahi.

Simple Language:

Authentication batata hai:

"User kaun hai?"

Authorization batata hai:

"User kya kar sakta hai?"

=============================================================================
AUTHENTICATION VS AUTHORIZATION
=============================================================================

Authentication

Login ho gaya?

Token valid hai?

User identify ho gaya?

-----------------------------------------------------------------------------

Authorization

User ka role kya hai?

Admin hai?

Viewer hai?

Permission hai?

=============================================================================
FLOW
=============================================================================

Request
   ↓
Authentication Middleware
   ↓
req.user Set
   ↓
Authorization Middleware
   ↓
Role Check
   ↓
Allowed ?
   ↓ YES
Controller
   ↓ NO
403 Forbidden

=============================================================================
authorize(allowedRoles)
=============================================================================

Ye ek middleware factory hai.

Matlab:

Ye middleware return karta hai.

Example:

authorize(["super_admin"])

authorize(["client_admin"])

authorize([
   "super_admin",
   "client_admin"
])

=============================================================================
STEP 1
=============================================================================

if (!req.user || !req.user.role)

Check karta hai:

User authenticated hai ya nahi.

-----------------------------------------------------------------------------

Agar:

req.user nahi mila

ya

role nahi mila

-----------------------------------------------------------------------------

Response:

403 Forbidden

=============================================================================
WHY req.user?
=============================================================================

Authentication middleware token verify karne ke baad:

req.user = {
   id: "...",
   role: "client_admin"
}

set karta hai.

Authorization middleware isi data ko use karta hai.

=============================================================================
STEP 2
=============================================================================

if (allowedRoles.length === 0)

Agar koi role define nahi kiya gaya.

-----------------------------------------------------------------------------

Example:

authorize()

-----------------------------------------------------------------------------

Matlab:

Authenticated user allowed hai.

-----------------------------------------------------------------------------

next()

Controller tak request chali jayegi.

=============================================================================
STEP 3
=============================================================================

allowedRoles.includes(req.user.role)

Check karta hai user ka role allowed list me hai ya nahi.

=============================================================================
EXAMPLE 1
=============================================================================

Route:

authorize(["super_admin"])

-----------------------------------------------------------------------------

User:

{
   role:"super_admin"
}

-----------------------------------------------------------------------------

Result:

Access Granted

=============================================================================
EXAMPLE 2
=============================================================================

Route:

authorize(["super_admin"])

-----------------------------------------------------------------------------

User:

{
   role:"client_admin"
}

-----------------------------------------------------------------------------

Result:

403 Forbidden

=============================================================================
EXAMPLE 3
=============================================================================

Route:

authorize([
   "super_admin",
   "client_admin"
])

-----------------------------------------------------------------------------

User:

{
   role:"client_admin"
}

-----------------------------------------------------------------------------

Result:

Access Granted

=============================================================================
INSUFFICIENT PERMISSIONS
=============================================================================

Agar role allowed nahi hua.

Response:

403 Forbidden

Message:

"Insufficient permissions"

=============================================================================
WHY 403?
=============================================================================

401 Unauthorized

Matlab:

User authenticated nahi hai.

-----------------------------------------------------------------------------

403 Forbidden

Matlab:

User authenticated hai

Lekin permission nahi hai.

=============================================================================
TRY CATCH
=============================================================================

Agar middleware ke andar koi unexpected error aa jaye.

-----------------------------------------------------------------------------

Catch block:

403 Forbidden

return karega.

Server crash nahi hoga.

=============================================================================
REAL PROJECT EXAMPLES
=============================================================================

Create Client

authorize(["super_admin"])

-----------------------------------------------------------------------------

Create User

authorize([
   "super_admin",
   "client_admin"
])

-----------------------------------------------------------------------------

View Analytics

authorize([
   "super_admin",
   "client_admin",
   "client_viewer"
])

-----------------------------------------------------------------------------

Delete Client

authorize(["super_admin"])

=============================================================================
ROLES IN YOUR PROJECT
=============================================================================

super_admin

Sab kuch access.

-----------------------------------------------------------------------------

client_admin

Apne client ko manage kar sakta hai.

-----------------------------------------------------------------------------

client_viewer

Sirf data dekh sakta hai.

=============================================================================
COMPLETE FLOW
=============================================================================

Login

↓

JWT Token

↓

Authentication Middleware

↓

req.user

↓

Authorization Middleware

↓

Role Check

↓

Controller

=============================================================================
EXAMPLE REQUEST
=============================================================================

GET /api/analytics

Required Role:

client_admin

-----------------------------------------------------------------------------

User Role:

client_viewer

-----------------------------------------------------------------------------

Response:

{
   success:false,
   message:"Insufficient permissions"
}

Status:

403

=============================================================================
INTERVIEW ANSWER
=============================================================================

Ye Role Based Access Control (RBAC) middleware hai jo authenticated
user ke role ko verify karta hai aur ensure karta hai ki sirf authorized
users hi protected routes ko access kar saken.

=============================================================================
IMPORTANT NOTE (BUG)
=============================================================================

Yaha ek chhota bug hai:

if (allowedRoles.length === 0) {
   next()
}

-----------------------------------------------------------------------------

next() ke baad return nahi hai.

Isliye code niche bhi execute hoga.

Better:

if (allowedRoles.length === 0) {
   return next();
}

-----------------------------------------------------------------------------

Production version:

if (allowedRoles.length === 0) {
   return next();
}

Ye unnecessary checks ko avoid karega.

=============================================================================
*/