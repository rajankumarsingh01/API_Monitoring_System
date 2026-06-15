import ResponseFormatter from "../../shared/utils/responseFormatter.js"

/**
 * Middleware to validate request bodies against a schema.
 * @param {Object} schema - The validation schema.
 * @returns {Function} - Returns a middleware function.
 * The validation schema is an object where each key is a field name and the value is an object that defines the validation rules for that field.
 * For example:
 * {
 *   username: { required: true },
 *   email: { required: true },
 *   password: { required: true, minLength: 6 }
 * }
 */
const validate = (schema) => (req, res, next) => {
    if (!schema) {
        return next()
    }

    const errors = [];
    const body = req.body || {};

    /**
     * {
     *  username: "Rahul"
     * }
     */
    Object.entries(schema).forEach(([field, rules]) => {
        const value = body[field] // body["username"]

        if (rules.required && (value === undefined || value === null || value === "")) {
            errors.push(`${field} is required`)
            return
        };

        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        if (rules.custom && typeof rules.custom === 'function') {
            const customErr = rules.custom(value, body);
            if (customErr) errors.push(customErr);
        }
    })

    if (errors.length) {
        return res.status(400).json(ResponseFormatter.error("Validation failed", 400, errors))
    }

    next()
}

export default validate









/*
=============================================================================
VALIDATE MIDDLEWARE
=============================================================================

Purpose:
Request body ko check karta hai ki required fields aur validation rules
follow ho rahe hain ya nahi.

Flow:

Request
   ↓
Validate Middleware
   ↓
Valid Data ? ---- NO ---> 400 Validation Error
   ↓ YES
Next Middleware / Controller

-----------------------------------------------------------------------------

validate(schema)

Ek middleware return karta hai jo incoming req.body ko validate karta hai.

Example Schema:

{
   username: { required: true },
   password: { required: true, minLength: 6 }
}

-----------------------------------------------------------------------------

1. Schema Check

Agar schema pass nahi hua hai to validation skip karke next() call kar deta hai.

-----------------------------------------------------------------------------

2. Required Validation

Check karta hai field:

undefined
null
""

to nahi hai.

Example:

{
   username: ""
}

Error:

username is required

-----------------------------------------------------------------------------

3. Min Length Validation

String field ki minimum length check karta hai.

Example:

password: "123"

Rule:

minLength: 6

Error:

password must be at least 6 characters

-----------------------------------------------------------------------------

4. Custom Validation

Custom function execute karta hai.

Example:

email: {
   custom: (value) => {
      if (!value.includes("@")) {
         return "Invalid email"
      }
   }
}

-----------------------------------------------------------------------------

5. Error Response

Agar errors milte hain to:

400 Bad Request

return karta hai.

Format:

{
   success:false,
   message:"Validation failed",
   errors:[...]
}

-----------------------------------------------------------------------------

6. next()

Agar validation pass ho jaye to request controller tak pahunch jati hai.

=============================================================================
INTERVIEW ANSWER
=============================================================================

Ye reusable validation middleware hai jo request body ko predefined
schema ke against validate karta hai aur invalid data ko controller
tak pahunchne se pehle hi reject kar deta hai.
=============================================================================
*/