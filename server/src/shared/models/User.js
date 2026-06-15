import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import SecurityUtils from "../utils/SecurityUtils.js";

/**
 * User Schema - Represents a user in the system with authentication and role-based access control.
 * Each user can be associated with a client (except super_admin) and has specific permissions.
 * Passwords are hashed before saving to the database for security.
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        validate: {
            validator: function (userName) {
                return /^[a-zA-Z0-9_.-]+$/.test(userName);
            },
            message: "Please enter a valid username"
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: "Please enter a valid email"
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        validate: {
            validator: function (password) {
                if (this.isModified('password') && password && !password.startsWith('$2a$')) {
                    const validation = SecurityUtils.validatePassword(password)
                    return validation.success
                };
                return true
            },
            message: function (props) {
                if (props.value && !props.value.startsWith('$2a$')) {
                    const validation = SecurityUtils.validatePassword(props.value)
                    // ["Password is required", "Password must contain at least one uppercase letter"]
                    // "Password is required. Password must contain at least one uppercase letter."
                    return validation.errors.join(". ");
                };
                return "Password validation failed"
            }
        },
    },
    role: {
        type: String,
        enum: ['super_admin', 'client_admin', 'client_viewer'],
        default: 'client_viewer'
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId, // 123
        ref: "Client",

        required: function () {
            return this.role !== "super_admin"
        }
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    permissions: {
        canCreateApiKeys: {
            type: Boolean,
            default: false,
        },
        canManageUsers: {
            type: Boolean,
            default: false,
        },
        canViewAnalytics: {
            type: Boolean,
            default: true,
        },
        canExportData: {
            type: Boolean,
            default: false,
        },
    },
}, {
    timestamps: true,
    collection: "users"
})

// Hash password before saving
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         return next();
//     }

//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

userSchema.pre('save', async function () {

    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
        this.password,
        salt
    );
});

// Indexes for efficient querying
userSchema.index({ clientId: 1, isActive: 1 });
userSchema.index({ role: 1 })

const User = mongoose.model("User", userSchema)
export default User;





















/*
=============================================================================
USER MODEL COMPLETE EXPLANATION (BEGINNER HINGLISH NOTES)
=============================================================================

Ye file MongoDB me User collection ka structure define karti hai.

Simple language me:

Jab bhi koi user register karega, login karega ya database me save hoga,
to uska data kis format me store hoga ye file decide karti hai.

Is model ka purpose hai:

1. User data structure define karna
2. Validation lagana
3. Password security maintain karna
4. Role Based Access Control (RBAC) implement karna
5. Database indexes banana
6. Password hashing automate karna

=============================================================================
IMPORTS
=============================================================================

mongoose
-> MongoDB ke saath kaam karne ke liye.

bcryptjs
-> Password ko hash (encrypt jaisa) karne ke liye.

SecurityUtils
-> Custom password validation utility.

=============================================================================
SCHEMA KYA HOTA HAI?
=============================================================================

Schema ek blueprint hota hai.

Jaise ghar banane se pehle map banta hai,
waise MongoDB document save hone se pehle schema banta hai.

Example User Document:

{
   username: "rajan",
   email: "rajan@gmail.com",
   password: "hashedPassword",
   role: "client_admin"
}

Ye structure userSchema define karta hai.

=============================================================================
USERNAME FIELD
=============================================================================

username: {
   type: String
}

Username sirf string hoga.

-----------------------------------------------------------------------------

required: true

Username dena mandatory hai.

Galat:

{
   email:"abc@gmail.com"
}

Sahi:

{
   username:"rajan",
   email:"abc@gmail.com"
}

-----------------------------------------------------------------------------

unique: true

Do users same username nahi rakh sakte.

Allowed:

rajan
rajan123

Not Allowed:

rajan
rajan

-----------------------------------------------------------------------------

trim: true

Starting aur ending spaces automatically remove ho jayengi.

Example:

"   rajan   "

Ban jayega:

"rajan"

-----------------------------------------------------------------------------

minlength: 3

Minimum 3 characters hone chahiye.

Allowed:

rajan

Not Allowed:

ra

-----------------------------------------------------------------------------

custom validator

Regex:

/^[a-zA-Z0-9_.-]+$/

Allowed Characters:

A-Z
a-z
0-9
_
.
-

Allowed:

rajan
rajan_123
rajan.dev

Not Allowed:

rajan@
rajan#
rajan$

Agar invalid hua to:

"Please enter a valid username"

error aayega.

=============================================================================
EMAIL FIELD
=============================================================================

Email user ka login identifier hai.

-----------------------------------------------------------------------------

required: true

Email mandatory hai.

-----------------------------------------------------------------------------

unique: true

Same email 2 users use nahi kar sakte.

-----------------------------------------------------------------------------

lowercase: true

Automatically lowercase me convert karega.

Example:

RAJAN@GMAIL.COM

Ban jayega:

rajan@gmail.com

-----------------------------------------------------------------------------

trim: true

Extra spaces remove karega.

-----------------------------------------------------------------------------

Email Regex Validation

Check karta hai email format valid hai ya nahi.

Allowed:

test@gmail.com

Not Allowed:

testgmail.com

Agar invalid hua:

"Please enter a valid email"

error aayega.

=============================================================================
PASSWORD FIELD
=============================================================================

Password user authentication ke liye use hota hai.

-----------------------------------------------------------------------------

required: true

Password mandatory hai.

-----------------------------------------------------------------------------

minlength: 6

Kam se kam 6 characters hone chahiye.

-----------------------------------------------------------------------------

CUSTOM PASSWORD VALIDATION

Yaha SecurityUtils.validatePassword() use ho raha hai.

Ye probably check karega:

- Uppercase letter
- Lowercase letter
- Number
- Special character
- Minimum length

Example:

Password123@

Allowed

password

Not Allowed

-----------------------------------------------------------------------------

IMPORTANT CHECK

!password.startsWith('$2a$')

Ye check karta hai password already hashed hai ya nahi.

Kyuki bcrypt hashed password kuch aise dikhta hai:

$2a$10$wqjhsdjkashdkjashdkjashd

Agar password already hashed hai to validation skip ho jayegi.

=============================================================================
ROLE FIELD
=============================================================================

Role Based Access Control (RBAC)

Role decide karta hai user kya kar sakta hai.

Possible Roles:

1. super_admin
2. client_admin
3. client_viewer

-----------------------------------------------------------------------------

super_admin

Sab kuch access kar sakta hai.

-----------------------------------------------------------------------------

client_admin

Apne client/company ko manage kar sakta hai.

-----------------------------------------------------------------------------

client_viewer

Sirf data dekh sakta hai.

-----------------------------------------------------------------------------

default

Agar role nahi diya gaya:

client_viewer

automatically assign ho jayega.

=============================================================================
CLIENT ID FIELD
=============================================================================

clientId: ObjectId

Ye Client collection ke document ko reference karta hai.

Example:

clientId:
6854123abcd123456789

-----------------------------------------------------------------------------

ref: "Client"

Mongoose ko batata hai ki ye Client model ko refer kar raha hai.

-----------------------------------------------------------------------------

required function

return this.role !== "super_admin"

Matlab:

Agar role super_admin hai

To clientId optional hai.

Kyuki super admin kisi ek client se belong nahi karta.

Lekin:

client_admin
client_viewer

ke liye clientId mandatory hai.

=============================================================================
ISACTIVE FIELD
=============================================================================

isActive: Boolean

User active hai ya disabled.

true

User login kar sakta hai.

false

User login nahi kar sakta.

-----------------------------------------------------------------------------

default: true

Naya user default active hoga.

=============================================================================
PERMISSIONS OBJECT
=============================================================================

Ye granular permissions define karta hai.

Role ke andar bhi extra control milta hai.

-----------------------------------------------------------------------------

canCreateApiKeys

API Keys bana sakta hai ya nahi.

-----------------------------------------------------------------------------

canManageUsers

Dusre users create/update/delete kar sakta hai ya nahi.

-----------------------------------------------------------------------------

canViewAnalytics

Analytics dashboard dekh sakta hai ya nahi.

-----------------------------------------------------------------------------

canExportData

Reports export kar sakta hai ya nahi.

=============================================================================
SCHEMA OPTIONS
=============================================================================

timestamps: true

Automatic 2 fields add hongi.

createdAt
updatedAt

Example:

{
   createdAt:"2026-06-15",
   updatedAt:"2026-06-15"
}

-----------------------------------------------------------------------------

collection: "users"

MongoDB collection ka naam manually set kiya gaya hai.

Collection:

users

=============================================================================
PRE SAVE MIDDLEWARE
=============================================================================

userSchema.pre("save")

Ye middleware save hone se pehle execute hota hai.

Flow:

User Register

↓

Validation

↓

Password Hash

↓

Database Save

-----------------------------------------------------------------------------

this.isModified('password')

Check karta hai password change hua ya nahi.

Agar password change nahi hua:

Hashing skip.

Ye performance improve karta hai.

-----------------------------------------------------------------------------

bcrypt.genSalt(10)

Salt generate karta hai.

Salt random data hota hai jo hashing ko aur secure banata hai.

-----------------------------------------------------------------------------

bcrypt.hash()

Plain Password:

Password123@

↓

Hashed Password:

$2a$10$asjhdjashdjkasdhjkas

Database me kabhi original password save nahi hota.

=============================================================================
WHY HASHING IMPORTANT?
=============================================================================

Without Hashing:

Database Leak

↓

Password visible

↓

Account hacked

-----------------------------------------------------------------------------

With Hashing:

Database Leak

↓

Sirf hash milega

↓

Original password pata lagana extremely difficult

=============================================================================
INDEXES
=============================================================================

Index database ki speed badhata hai.

Jaise book ke last me index page hota hai.

Waise MongoDB me indexes search fast karte hain.

-----------------------------------------------------------------------------

Index 1

clientId + isActive

Useful queries:

Find active users of a client

Example:

{
   clientId: xyz,
   isActive: true
}

-----------------------------------------------------------------------------

Index 2

role

Useful queries:

Find all admins

Example:

{
   role: "client_admin"
}

Ye query fast chalegi.

=============================================================================
MODEL CREATION
=============================================================================

const User = mongoose.model("User", userSchema)

Schema ko actual MongoDB model me convert karta hai.

Ab hum kar sakte hain:

User.create()

User.find()

User.findOne()

User.updateOne()

etc.

=============================================================================
EXPORT
=============================================================================

export default User

Taaki project ke dusre files me use kar sake.

Example:

import User from "./models/User.js"

=============================================================================
COMPLETE USER REGISTRATION FLOW
=============================================================================

User Register Request

↓

username validate

↓

email validate

↓

password validate

↓

role validate

↓

clientId validate

↓

pre save middleware

↓

password hash

↓

MongoDB save

↓

User Created

=============================================================================
INTERVIEW ONE LINE ANSWER
=============================================================================

Ye User model MongoDB me user authentication, authorization,
role-based access control, permission management, password security,
validation aur database optimization ko handle karta hai. Password
save hone se pehle automatically bcrypt hashing hoti hai aur schema
user data ki integrity ensure karta hai.
=============================================================================
*/