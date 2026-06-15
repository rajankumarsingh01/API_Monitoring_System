import mongoose from 'mongoose';
import SecurityUtils from '../utils/SecurityUtils.js';

/**
 * MongoDB schema for API keys
 * Each API key belongs to a client and is used for authentication
 */
const apiKeySchema = new mongoose.Schema(
    {
        keyId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        keyValue: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId, // 123
            ref: 'Client',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            maxlength: 500,
            default: '',
        },
        environment: {
            type: String,
            enum: ['production', 'staging', 'development', 'testing'],
            default: 'production',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        permissions: {
            canIngest: {
                type: Boolean,
                default: true,
            },
            canReadAnalytics: {
                type: Boolean,
                default: false,
            },
            allowedServices: [{
                type: String,
                trim: true,
            }],
        },
        // usage and per-key rate limiting removed
        security: {
            allowedIPs: [{
                type: String,
                validate: {
                    validator: function (v) {
                        return /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(v) ||
                            v === '0.0.0.0/0';
                    },
                    message: 'Invalid IP address format'
                }
            }],
            allowedOrigins: [{
                type: String,
                validate: {
                    validator: function (v) {
                        return /^https?:\/\/[^\s]+$/.test(v) || v === '*';
                    },
                    message: 'Invalid origin format'
                }
            }],
            lastRotated: {
                type: Date,
                default: Date.now,
            },
            rotationWarningDays: {
                type: Number,
                default: 30,
            },
        },
        expiresAt: {
            type: Date,
            default: () => {
                const days = parseInt(process.env.API_KEY_EXPIRY_DAYS || '365');
                return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            },
            index: true,
        },
        metadata: {
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            purpose: {
                type: String,
                trim: true,
                maxlength: 200,
            },
            tags: [{
                type: String,
                trim: true,
                maxlength: 50,
            }],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'api_keys',
    }
);

apiKeySchema.index({ clientId: 1, isActive: 1 });
apiKeySchema.index({ keyValue: 1, isActive: 1 });
apiKeySchema.index({ environment: 1, clientId: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

apiKeySchema.methods.isExpired = function () {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;













/*
=============================================================================
API KEY MODEL COMPLETE EXPLANATION (BEGINNER HINGLISH NOTES)
=============================================================================

Ye file MongoDB me API Keys ka structure define karti hai.

Simple language me:

Jab koi client tumhare monitoring system me apni application connect karega,
to usko ek API Key di jayegi.

Us API Key ke through hi tumhara system identify karega:

"Ye request kis client se aa rahi hai?"

Ye model wahi API Keys store karta hai.

=============================================================================
REAL WORLD EXAMPLE
=============================================================================

Maan lo ek company hai:

TechCorp

Usne tumhare monitoring SaaS par account banaya.

Ab usko monitoring data bhejne ke liye ek API Key milegi.

Example:

keyId:
ak_123456

keyValue:
YOUR_SECRET_KEYxxxxxxxxxxxxxxxxx

Ab jab bhi TechCorp data bhejega:

POST /api/hit

Header:

x-api-key: YOUR_SECRET_KEYxxxxxxxxxxxxxxxxx

Tumhara backend verify karega:

1. API Key valid hai?
2. Active hai?
3. Expire to nahi hui?
4. Is client ki hai?
5. Permission hai?

Agar sab sahi hai to request allow hogi.

=============================================================================
IMPORTS
=============================================================================

mongoose

MongoDB schema aur model banane ke liye.

-----------------------------------------------------------------------------

SecurityUtils

Import kiya gaya hai.

Lekin is file me use nahi ho raha.

Ye unnecessary import lag raha hai.

Future me remove kar sakte ho.

=============================================================================
KEY ID FIELD
=============================================================================

keyId

Human friendly unique identifier.

Example:

ak_12345
ak_prod_123

-----------------------------------------------------------------------------

required: true

Mandatory hai.

-----------------------------------------------------------------------------

unique: true

Duplicate nahi ho sakta.

-----------------------------------------------------------------------------

index: true

Search fast hogi.

=============================================================================
WHY KEY ID?
=============================================================================

Actual API Key bahut badi hoti hai.

Example:

YOUR_SECRET_KEYasdjahsjdhjashdjkahsdkjashd

UI me dikhana mushkil hai.

Isliye:

keyId

use kiya jata hai.

Example:

API Key Name:
Production Key

Key ID:
ak_prod_123

=============================================================================
KEY VALUE FIELD
=============================================================================

Ye actual secret API Key hai.

Example:

YOUR_SECRET_KEYabcd123456789xyz

-----------------------------------------------------------------------------

required: true

Mandatory.

-----------------------------------------------------------------------------

unique: true

Har API Key unique hogi.

-----------------------------------------------------------------------------

index: true

Authentication fast hoga.

=============================================================================
IMPORTANT SECURITY CONCEPT
=============================================================================

Jab request aayegi:

x-api-key: YOUR_SECRET_KEYabcd123

Backend:

ApiKey.findOne({
   keyValue: receivedKey
})

Karke verify karega.

Ye actual authentication secret hai.

=============================================================================
CLIENT ID FIELD
=============================================================================

clientId

Batata hai API Key kis client ki hai.

-----------------------------------------------------------------------------

Example:

TechCorp

↓

clientId

↓

6854abc123

-----------------------------------------------------------------------------

ref: "Client"

Relationship:

Client
   |
   +---- API Keys

-----------------------------------------------------------------------------

required: true

Har API Key kisi na kisi client ki honi chahiye.

-----------------------------------------------------------------------------

index: true

Client specific queries fast hongi.

=============================================================================
NAME FIELD
=============================================================================

API Key ka friendly name.

Example:

Production Key

Development Key

Mobile App Key

Backend Key

-----------------------------------------------------------------------------

required: true

Mandatory.

-----------------------------------------------------------------------------

trim: true

Extra spaces remove.

-----------------------------------------------------------------------------

maxlength: 100

Maximum 100 characters.

=============================================================================
DESCRIPTION FIELD
=============================================================================

API Key ka purpose.

Example:

"Used by production backend"

-----------------------------------------------------------------------------

Optional field.

-----------------------------------------------------------------------------

default: ""

Empty string save hogi.

=============================================================================
ENVIRONMENT FIELD
=============================================================================

Ye batata hai key kis environment ke liye hai.

Possible values:

production
staging
development
testing

-----------------------------------------------------------------------------

Production

Live users.

-----------------------------------------------------------------------------

Staging

Testing before production.

-----------------------------------------------------------------------------

Development

Developer machine.

-----------------------------------------------------------------------------

Testing

QA testing.

-----------------------------------------------------------------------------

default:

production

=============================================================================
ISACTIVE FIELD
=============================================================================

API Key active hai ya disabled.

-----------------------------------------------------------------------------

true

Request allow.

-----------------------------------------------------------------------------

false

Request reject.

-----------------------------------------------------------------------------

default:

true

=============================================================================
PERMISSIONS OBJECT
=============================================================================

Ye API Key level permissions hain.

Dhyan rahe:

Ye User permissions nahi hain.

Ye API Key permissions hain.

=============================================================================
CAN INGEST
=============================================================================

canIngest

Monitoring data bhej sakta hai ya nahi.

-----------------------------------------------------------------------------

true

/api/hit allowed.

-----------------------------------------------------------------------------

false

/api/hit blocked.

=============================================================================
CAN READ ANALYTICS
=============================================================================

Analytics access allowed hai ya nahi.

-----------------------------------------------------------------------------

true

Analytics APIs access.

-----------------------------------------------------------------------------

false

Analytics access blocked.

=============================================================================
ALLOWED SERVICES
=============================================================================

Ye whitelist hai.

Example:

[
  "payment-service",
  "user-service",
  "notification-service"
]

Sirf ye services data bhej sakti hain.

=============================================================================
SECURITY OBJECT
=============================================================================

API Key ki additional security settings.

=============================================================================
ALLOWED IPS
=============================================================================

IP Whitelisting.

Example:

[
  "192.168.1.10",
  "10.0.0.0/24"
]

-----------------------------------------------------------------------------

Regex Validate karta hai:

Valid IP

192.168.1.1

Valid CIDR

192.168.1.0/24

-----------------------------------------------------------------------------

Special Value

0.0.0.0/0

Matlab:

Sab IPs allowed.

=============================================================================
WHY IP WHITELISTING?
=============================================================================

Agar API Key leak ho jaye.

Tab bhi attacker request nahi bhej payega.

Kyuki uska IP whitelist me nahi hoga.

Ye enterprise security feature hai.

=============================================================================
ALLOWED ORIGINS
=============================================================================

Frontend domains whitelist.

Example:

https://app.techcorp.com

https://dashboard.techcorp.com

-----------------------------------------------------------------------------

Regex validate karta hai.

Sirf valid URLs allow.

-----------------------------------------------------------------------------

Special Value

*

Matlab:

Sab origins allowed.

=============================================================================
LAST ROTATED
=============================================================================

Batata hai API Key last kab regenerate hui.

-----------------------------------------------------------------------------

default:

Current Date

=============================================================================
KEY ROTATION KYA HOTA HAI?
=============================================================================

Security best practice.

Purani key

↓

New key

Generate

-----------------------------------------------------------------------------

Isse leaked keys ka risk kam hota hai.

=============================================================================
ROTATION WARNING DAYS
=============================================================================

Default:

30

-----------------------------------------------------------------------------

Meaning:

30 din baad warning bhejo ki key rotate karni chahiye.

=============================================================================
EXPIRES AT
=============================================================================

API Key kab expire hogi.

-----------------------------------------------------------------------------

Default Logic

process.env.API_KEY_EXPIRY_DAYS

Agar env me:

365

hai

To key:

1 year

baad expire hogi.

-----------------------------------------------------------------------------

Example:

Created:

2026

Expire:

2027

=============================================================================
METADATA OBJECT
=============================================================================

Additional information.

=============================================================================
CREATED BY
=============================================================================

Kis user ne key create ki.

-----------------------------------------------------------------------------

Relationship:

User
   |
   +---- created API Key

=============================================================================
PURPOSE
=============================================================================

Key ka purpose.

Example:

"Production Backend Authentication"

=============================================================================
TAGS
=============================================================================

Categorization.

Example:

[
  "production",
  "backend",
  "critical"
]

=============================================================================
TOP LEVEL CREATED BY
=============================================================================

Ye bhi creator user ko store karta hai.

-----------------------------------------------------------------------------

required: true

Mandatory.

-----------------------------------------------------------------------------

NOTE

Metadata.createdBy aur createdBy dono hain.

Ye thoda duplicate lag raha hai.

Review kar sakte ho.

=============================================================================
TIMESTAMPS
=============================================================================

Automatic fields:

createdAt
updatedAt

=============================================================================
COLLECTION
=============================================================================

MongoDB Collection:

api_keys

=============================================================================
INDEXES
=============================================================================

INDEX 1

clientId + isActive

Useful Query:

Find active keys of a client.

-----------------------------------------------------------------------------

INDEX 2

keyValue + isActive

Useful Query:

Authenticate API Key.

Ye sabse important index hai.

-----------------------------------------------------------------------------

INDEX 3

environment + clientId

Useful Query:

Find production keys.

Find staging keys.

=============================================================================
TTL INDEX
=============================================================================

expiresAt Index

{
  expireAfterSeconds: 0
}

Bahut powerful MongoDB feature.

-----------------------------------------------------------------------------

Jab key expire hogi

MongoDB automatically delete kar dega.

Manual cleanup ki zarurat nahi.

=============================================================================
EXAMPLE
=============================================================================

Today:

2026

Expire:

2027

-----------------------------------------------------------------------------

2027 ke baad

MongoDB

↓

Automatically Delete

=============================================================================
INSTANCE METHOD
=============================================================================

apiKeySchema.methods.isExpired

Custom method.

-----------------------------------------------------------------------------

Use:

apiKey.isExpired()

-----------------------------------------------------------------------------

Returns:

true

Ya

false

-----------------------------------------------------------------------------

Logic:

Current Date

>

expiresAt

?

Expired

: Not Expired

=============================================================================
MODEL CREATION
=============================================================================

const ApiKey = mongoose.model(
   "ApiKey",
   apiKeySchema
)

Schema ko MongoDB model me convert karta hai.

=============================================================================
EXPORT
=============================================================================

export default ApiKey

Dusri files me use karne ke liye.

=============================================================================
COMPLETE AUTHENTICATION FLOW
=============================================================================

Client Request

↓

x-api-key Received

↓

Find ApiKey

↓

isActive Check

↓

isExpired Check

↓

IP Validation

↓

Origin Validation

↓

Permission Validation

↓

Client Identify

↓

Request Allowed

=============================================================================
PROJECT ARCHITECTURE SO FAR
=============================================================================

Platform
   |
   +---- Clients
            |
            +---- Users
            |
            +---- API Keys
                     |
                     +---- Authentication
                     |
                     +---- Monitoring Hits
                     |
                     +---- Analytics

=============================================================================
DATABASE EXAMPLE
=============================================================================

{
  "keyId":"ak_prod_123",

  "keyValue":"YOUR_SECRET_KEYxxxxxxxxxxx",

  "clientId":"6854abc123",

  "name":"Production Key",

  "environment":"production",

  "isActive":true,

  "permissions":{
      "canIngest":true,
      "canReadAnalytics":false
  },

  "security":{
      "allowedIPs":[
          "192.168.1.1"
      ]
  },

  "expiresAt":"2027-06-15"
}

=============================================================================
INTERVIEW ONE LINE ANSWER
=============================================================================

Ye ApiKey model monitoring system me client authentication aur security
ko handle karta hai. Isme API Key information, permissions, environment,
IP restrictions, origin restrictions, expiration policies aur automatic
TTL cleanup store hota hai jisse secure API access provide kiya ja sake.

=============================================================================
IMPORTANT ARCHITECTURE UNDERSTANDING
=============================================================================

Ab tak project ka SaaS hierarchy:

Platform
   |
   +---- Client
            |
            +---- Users
            |
            +---- API Keys
                     |
                     +---- Monitoring Events
                     |
                     +---- Analytics
                     |
                     +---- Alerts

Ab next models me tum most probably:

Monitoring Hit
Analytics
Alert
Audit Log

jaise core monitoring entities dekhoge.

Wahi actual monitoring system ka heart hoga.
=============================================================================
*/