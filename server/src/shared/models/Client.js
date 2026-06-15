import mongoose from 'mongoose';

/**
 * MongoDB schema for clients/organizations
 * Each client represents a business/organization using the monitoring service
 */
const clientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: /^[a-z0-9-]+$/,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            maxlength: 500,
            default: '',
        },
        website: {
            type: String,
            default: '',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        settings: {
            dataRetentionDays: {
                type: Number,
                default: 30,
                min: 7,
                max: 365,
            },
            alertsEnabled: {
                type: Boolean,
                default: true,
            },
            timezone: {
                type: String,
                default: 'UTC',
            },
        },
    },
    {
        timestamps: true,
        collection: 'clients',
    }
);

clientSchema.index({ isActive: 1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;






















/*
=============================================================================
CLIENT MODEL COMPLETE EXPLANATION (BEGINNER HINGLISH NOTES)
=============================================================================

Ye file MongoDB me Client (Organization/Company) collection ka structure
define karti hai.

Simple language me:

User model individual user ko represent karta tha.

Client model ek company/organization ko represent karta hai.

Maan lo tumhara monitoring SaaS launch ho gaya.

To:

Google
Microsoft
Amazon

jaise companies tumhari service use kar sakti hain.

Har company ek Client document hogi.

=============================================================================
REAL WORLD EXAMPLE
=============================================================================

Monitoring SaaS

↓

Client (Company)

↓

Users

↓

API Keys

↓

Analytics

Example:

Client:
TechCorp Pvt Ltd

Uske andar:

Admin User
Viewer User
API Keys
Analytics Data
Monitoring Reports

Sab kuch us client ke under rahega.

=============================================================================
IMPORT
=============================================================================

mongoose

MongoDB ke saath kaam karne ke liye.

Schema aur Model banane ke liye use hota hai.

=============================================================================
SCHEMA CREATION
=============================================================================

const clientSchema = new mongoose.Schema(...)

Schema ek blueprint hota hai.

Ye decide karta hai:

Client document me kaunsi fields hongi.

Kaunsi required hongi.

Kaunsi validation follow karegi.

=============================================================================
NAME FIELD
=============================================================================

name: {
   type: String
}

Company ka naam store karega.

Example:

Google

Microsoft

TechCorp Pvt Ltd

-----------------------------------------------------------------------------

required: true

Client ka naam dena mandatory hai.

Galat:

{}

Sahi:

{
   name: "TechCorp"
}

-----------------------------------------------------------------------------

trim: true

Starting aur ending spaces remove karega.

Example:

"   TechCorp   "

Ban jayega:

"TechCorp"

-----------------------------------------------------------------------------

minlength: 2

Minimum 2 characters required.

-----------------------------------------------------------------------------

maxlength: 100

Maximum 100 characters allowed.

Database me garbage data jane se rokta hai.

=============================================================================
SLUG FIELD
=============================================================================

Ye bahut important field hai.

-----------------------------------------------------------------------------

Slug kya hota hai?

URL Friendly Unique Name.

Example:

Company Name:

Tech Corp Pvt Ltd

Slug:

tech-corp-pvt-ltd

-----------------------------------------------------------------------------

required: true

Slug mandatory hai.

-----------------------------------------------------------------------------

unique: true

Har client ka slug unique hoga.

Allowed:

techcorp

my-company

company-123

Not Allowed:

Do clients same slug use nahi kar sakte.

-----------------------------------------------------------------------------

trim: true

Spaces remove karega.

-----------------------------------------------------------------------------

lowercase: true

Automatically lowercase me convert karega.

Example:

TechCorp

Ban jayega:

techcorp

-----------------------------------------------------------------------------

Regex Validation

/^[a-z0-9-]+$/

Allowed:

techcorp

tech-corp

company123

company-123

Not Allowed:

TechCorp
company@
company#
company space

Sirf:

a-z
0-9
-

allowed hai.

=============================================================================
SLUG KA REAL USE
=============================================================================

Example API:

/api/client/techcorp

ya

https://monitoring.com/clients/techcorp

Slug URL me use hota hai.

Isliye unique aur clean hona zaroori hai.

=============================================================================
EMAIL FIELD
=============================================================================

Client company ka official email.

Example:

admin@techcorp.com

-----------------------------------------------------------------------------

required: true

Email mandatory hai.

-----------------------------------------------------------------------------

lowercase: true

Automatically lowercase karega.

-----------------------------------------------------------------------------

trim: true

Spaces remove karega.

-----------------------------------------------------------------------------

NOTE

Yaha email validation nahi lagaya gaya.

Future improvement:

Regex validation add kar sakte ho.

=============================================================================
DESCRIPTION FIELD
=============================================================================

Company ke baare me information.

Example:

"We provide cloud infrastructure solutions"

-----------------------------------------------------------------------------

maxlength: 500

Maximum 500 characters.

-----------------------------------------------------------------------------

default: ''

Agar description nahi di gayi to empty string save hogi.

=============================================================================
WEBSITE FIELD
=============================================================================

Company ki website.

Example:

https://techcorp.com

-----------------------------------------------------------------------------

default: ''

Optional field hai.

User website de bhi sakta hai aur nahi bhi.

-----------------------------------------------------------------------------

NOTE

Yaha URL validation nahi lagaya gaya.

Future improvement:

URL regex validation add kar sakte ho.

=============================================================================
CREATED BY FIELD
=============================================================================

createdBy: ObjectId

Bahut important field.

Ye batata hai:

Ye client kis user ne create kiya.

-----------------------------------------------------------------------------

Example

User:

Rajan

↓

Client Create

↓

TechCorp

To:

createdBy = Rajan User ID

-----------------------------------------------------------------------------

ref: "User"

Mongoose ko batata hai:

Ye User collection ko reference kar raha hai.

-----------------------------------------------------------------------------

required: true

Har client ka creator hona zaroori hai.

=============================================================================
RELATIONSHIP
=============================================================================

User
   |
   |
   +---- creates
   |
   v
Client

Example:

User ID:
6854123abcd

↓

Client:

TechCorp

createdBy:
6854123abcd

=============================================================================
ISACTIVE FIELD
=============================================================================

Client active hai ya disabled.

-----------------------------------------------------------------------------

true

Client service use kar sakta hai.

-----------------------------------------------------------------------------

false

Client disabled hai.

Monitoring stop ho sakti hai.

Login block ho sakta hai.

API usage block ho sakta hai.

-----------------------------------------------------------------------------

default: true

Naya client automatically active hoga.

=============================================================================
SETTINGS OBJECT
=============================================================================

Ye client specific settings store karta hai.

Har company apni settings rakh sakti hai.

=============================================================================
DATA RETENTION DAYS
=============================================================================

Monitoring data kitne din tak preserve karna hai.

-----------------------------------------------------------------------------

default: 30

Default:

30 days

-----------------------------------------------------------------------------

min: 7

Kam se kam:

7 din

-----------------------------------------------------------------------------

max: 365

Maximum:

365 din

-----------------------------------------------------------------------------

Example

30 days

Purana analytics data automatically delete ho sakta hai.

=============================================================================
ALERTS ENABLED
=============================================================================

alertsEnabled

Monitoring alerts on/off.

-----------------------------------------------------------------------------

true

Email Alerts
Webhook Alerts
Notifications

Enabled

-----------------------------------------------------------------------------

false

Koi alert nahi bheja jayega.

-----------------------------------------------------------------------------

default: true

=============================================================================
TIMEZONE
=============================================================================

Client ki timezone.

-----------------------------------------------------------------------------

default:

UTC

-----------------------------------------------------------------------------

Example:

Asia/Kolkata

America/New_York

Europe/London

-----------------------------------------------------------------------------

Monitoring reports aur analytics ko timezone ke according show karne me
help karta hai.

=============================================================================
SCHEMA OPTIONS
=============================================================================

timestamps: true

Automatically add karta hai:

createdAt
updatedAt

-----------------------------------------------------------------------------

Example:

{
   createdAt: "2026-06-15",
   updatedAt: "2026-06-15"
}

-----------------------------------------------------------------------------

collection: "clients"

MongoDB collection ka naam forcefully set kiya gaya hai.

Collection Name:

clients

=============================================================================
INDEX
=============================================================================

clientSchema.index({ isActive: 1 })

Database search ko fast banata hai.

-----------------------------------------------------------------------------

Example Query:

Find all active clients

{
   isActive: true
}

Ye query index ki wajah se fast chalegi.

=============================================================================
MODEL CREATION
=============================================================================

const Client = mongoose.model(
   "Client",
   clientSchema
)

Schema ko actual MongoDB model me convert karta hai.

Ab hum use kar sakte hain:

Client.create()

Client.find()

Client.findById()

Client.updateOne()

Client.deleteOne()

etc.

=============================================================================
EXPORT
=============================================================================

export default Client

Dusri files me use karne ke liye export kiya gaya hai.

Example:

import Client from "./models/Client.js"

=============================================================================
COMPLETE CLIENT CREATION FLOW
=============================================================================

Admin User

↓

Create Client Request

↓

Name Validation

↓

Slug Validation

↓

Email Validation

↓

Settings Validation

↓

MongoDB Save

↓

Client Created

=============================================================================
RELATIONSHIP WITH USER MODEL
=============================================================================

User Model
   |
   |
   +---- createdBy
   |
   v
Client Model

-----------------------------------------------------------------------------

Future me likely relationship:

Client
   |
   +---- Users
   |
   +---- API Keys
   |
   +---- Monitoring Hits
   |
   +---- Analytics
   |
   +---- Alerts

Matlab Client top level organization entity hai.

=============================================================================
DATABASE EXAMPLE
=============================================================================

{
   "_id":"6854abc123",

   "name":"TechCorp Pvt Ltd",

   "slug":"techcorp",

   "email":"admin@techcorp.com",

   "description":"Cloud Monitoring Company",

   "website":"https://techcorp.com",

   "createdBy":"6854user123",

   "isActive":true,

   "settings":{
      "dataRetentionDays":30,
      "alertsEnabled":true,
      "timezone":"UTC"
   },

   "createdAt":"2026-06-15",

   "updatedAt":"2026-06-15"
}

=============================================================================
INTERVIEW ONE LINE ANSWER
=============================================================================

Ye Client model monitoring SaaS me organizations/companies ko represent
karta hai. Isme company information, ownership details, monitoring
settings, data retention policies aur account status store hota hai.
Ye multi-tenant architecture ka foundation hai jahan ek client ke
andar multiple users, API keys aur analytics data manage kiye ja sakte hain.

=============================================================================
IMPORTANT ARCHITECTURE UNDERSTANDING
=============================================================================

Ab tak tumhare project me hierarchy kuch aisi ban rahi hai:

Platform (Monitoring SaaS)
        |
        |
        v
      Client
        |
        |
        v
      Users
        |
        |
        v
     API Keys
        |
        |
        v
  Monitoring Data
        |
        |
        v
    Analytics

Ye Multi Tenant SaaS Architecture kehlata hai.

Yahi architecture real world products me use hota hai:

Postman
Datadog
New Relic
Grafana Cloud
Sentry

Bas unka scale bahut bada hota hai.

=============================================================================
*/