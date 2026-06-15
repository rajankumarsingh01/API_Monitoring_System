import mongoose from 'mongoose';

/**
 * MongoDB schema for raw API hit events
 * Stores every individual API call
 */
const apiHitSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        timestamp: {
            type: Date,
            required: true,
        },
        serviceName: {
            type: String,
            required: true,
            index: true,
        },
        endpoint: {
            type: String,
            required: true,
            index: true,
        },
        method: {
            type: String,
            required: true,
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        },
        statusCode: {
            type: Number,
            required: true,
            index: true,
        },
        latencyMs: {
            type: Number,
            required: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
            index: true,
        },
        apiKeyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ApiKey',
            required: true,
            index: true,
        },
        ip: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
        collection: 'api_hits',
    }
);

// Create compound indexes for common queries
apiHitSchema.index({ clientId: 1, serviceName: 1, endpoint: 1, timestamp: -1 });
apiHitSchema.index({ clientId: 1, timestamp: -1, statusCode: 1 });
apiHitSchema.index({ apiKeyId: 1, timestamp: -1 });
apiHitSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const ApiHit = mongoose.model('ApiHit', apiHitSchema);

export default ApiHit;











/*
=============================================================================
API HIT MODEL COMPLETE EXPLANATION (BEGINNER HINGLISH NOTES)
=============================================================================

Ye file poore monitoring system ka sabse important model hai.

Simple language me:

Jab bhi kisi client ki application me API call hoti hai,
us API call ka ek record yaha save hota hai.

Ye model raw monitoring events store karta hai.

=============================================================================
REAL WORLD EXAMPLE
=============================================================================

Maan lo TechCorp tumhara monitoring system use kar raha hai.

Uski application ne request bheji:

GET /api/users

Response Time:
120ms

Status:
200

Time:
10:00 AM

To MongoDB me ek ApiHit document save hoga.

Example:

{
   eventId:"evt_123",

   serviceName:"user-service",

   endpoint:"/api/users",

   method:"GET",

   statusCode:200,

   latencyMs:120
}

=============================================================================
IMPORTANT UNDERSTANDING
=============================================================================

Client Model
     |
     +---- Company

User Model
     |
     +---- Dashboard Users

ApiKey Model
     |
     +---- Authentication

ApiHit Model
     |
     +---- Actual Monitoring Data

Ye model tumhare poore SaaS ka heart hai.

Analytics isi data se banegi.

Alerts isi data se trigger honge.

Reports isi data se generate hongi.

=============================================================================
EVENT ID
=============================================================================

eventId

Har API hit ki unique identity.

Example:

evt_123456

evt_987654

-----------------------------------------------------------------------------

required: true

Mandatory.

-----------------------------------------------------------------------------

unique: true

Duplicate event store nahi hoga.

-----------------------------------------------------------------------------

index: true

Fast searching.

=============================================================================
WHY EVENT ID?
=============================================================================

Maan lo RabbitMQ same event do baar bhej de.

EventId unique hone ki wajah se duplicate record save nahi hoga.

Ye monitoring systems me bahut common protection hai.

=============================================================================
TIMESTAMP
=============================================================================

Event kab hua.

Example:

2026-06-15T10:30:00Z

-----------------------------------------------------------------------------

required: true

Mandatory.

=============================================================================
WHY TIMESTAMP IMPORTANT?
=============================================================================

Monitoring me sabse important cheez:

Event kab hua?

Without timestamp:

Analytics impossible.

Graphs impossible.

Alerts impossible.

=============================================================================
SERVICE NAME
=============================================================================

Request kis service me hui.

Example:

user-service

payment-service

auth-service

notification-service

-----------------------------------------------------------------------------

required: true

Mandatory.

-----------------------------------------------------------------------------

index: true

Service specific search fast.

=============================================================================
MICROSERVICE EXAMPLE
=============================================================================

Application

|

+---- user-service

+---- payment-service

+---- notification-service

Har service apna monitoring data bhej sakti hai.

=============================================================================
ENDPOINT
=============================================================================

Kaunsi API hit hui.

Example:

/api/users

/api/orders

/api/payments

-----------------------------------------------------------------------------

required: true

Mandatory.

-----------------------------------------------------------------------------

index: true

Endpoint specific analytics fast.

=============================================================================
METHOD
=============================================================================

HTTP Method.

Allowed Values:

GET
POST
PUT
PATCH
DELETE
OPTIONS
HEAD

-----------------------------------------------------------------------------

enum

Sirf ye values allow hongi.

Example:

GET

Allowed

-----------------------------------------------------------------------------

ABC

Not Allowed

=============================================================================
STATUS CODE
=============================================================================

Response status.

Example:

200

201

400

401

403

404

500

-----------------------------------------------------------------------------

required: true

Mandatory.

-----------------------------------------------------------------------------

index: true

Error analytics fast.

=============================================================================
WHY STATUS CODE IMPORTANT?
=============================================================================

Monitoring Dashboard Example:

200 Success
95%

500 Errors
5%

Ye sab statusCode se niklega.

=============================================================================
LATENCY MS
=============================================================================

API response kitni fast thi.

Unit:

Milliseconds

(ms)

-----------------------------------------------------------------------------

Examples:

20ms

Fast

-----------------------------------------------------------------------------

150ms

Normal

-----------------------------------------------------------------------------

1200ms

Slow

-----------------------------------------------------------------------------

5000ms

Very Slow

=============================================================================
WHY LATENCY IMPORTANT?
=============================================================================

Monitoring Dashboard:

Average Response Time

P95 Response Time

P99 Response Time

Slow Endpoints

Sab latency se calculate hoga.

=============================================================================
CLIENT ID
=============================================================================

Event kis client ka hai.

-----------------------------------------------------------------------------

Example

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
   +---- Api Hits

-----------------------------------------------------------------------------

required: true

Mandatory.

-----------------------------------------------------------------------------

index: true

Client specific queries fast.

=============================================================================
API KEY ID
=============================================================================

Event kis API Key ke through aaya.

-----------------------------------------------------------------------------

Example:

Production Key

↓

apiKeyId

-----------------------------------------------------------------------------

ref: "ApiKey"

Relationship:

ApiKey
   |
   +---- Api Hits

-----------------------------------------------------------------------------

required: true

Mandatory.

-----------------------------------------------------------------------------

index: true

Authentication based analytics fast.

=============================================================================
IP ADDRESS
=============================================================================

Request kis IP se aayi.

Example:

192.168.1.10

-----------------------------------------------------------------------------

required: true

Mandatory.

=============================================================================
WHY STORE IP?
=============================================================================

Security

Abuse Detection

Traffic Analysis

Suspicious Activity Detection

=============================================================================
USER AGENT
=============================================================================

Request kis application/browser ne bheji.

Example:

Mozilla/5.0

Chrome

Node.js

Axios

Postman

-----------------------------------------------------------------------------

default: ""

Optional.

=============================================================================
TIMESTAMPS
=============================================================================

Automatic Fields:

createdAt

updatedAt

-----------------------------------------------------------------------------

createdAt

MongoDB me save kab hua.

-----------------------------------------------------------------------------

timestamp

Actual event kab hua.

-----------------------------------------------------------------------------

IMPORTANT DIFFERENCE

timestamp

= API hit ka time

createdAt

= Database save time

Ye dono alag ho sakte hain.

=============================================================================
COLLECTION
=============================================================================

MongoDB Collection:

api_hits

=============================================================================
COMPOUND INDEXES
=============================================================================

Ye performance optimize karte hain.

Monitoring systems me millions of records ho sakte hain.

Isliye indexes bahut important hain.

=============================================================================
INDEX 1
=============================================================================

{
 clientId,
 serviceName,
 endpoint,
 timestamp
}

Use Case:

Client ke kisi specific endpoint ka recent history dekhna.

Example:

TechCorp

↓

user-service

↓

/api/users

↓

Last 24 Hours

=============================================================================
INDEX 2
=============================================================================

{
 clientId,
 timestamp,
 statusCode
}

Use Case:

Error analytics.

Example:

Client:

TechCorp

Last 7 Days

Status:

500

-----------------------------------------------------------------------------

Ye query fast chalegi.

=============================================================================
INDEX 3
=============================================================================

{
 apiKeyId,
 timestamp
}

Use Case:

Specific API Key ki activity dekhna.

Example:

Production Key

↓

Last 30 Days Usage

=============================================================================
TTL INDEX
=============================================================================

{
 timestamp: 1
},
{
 expireAfterSeconds: 2592000
}

Bahut powerful MongoDB feature.

=============================================================================
TTL KYA HOTA HAI?
=============================================================================

Time To Live

MongoDB automatically old records delete karta hai.

=============================================================================
2592000 SECONDS
=============================================================================

2592000 seconds

=

30 Days

-----------------------------------------------------------------------------

Meaning:

30 din purane records automatically delete.

=============================================================================
EXAMPLE
=============================================================================

API Hit:

1 January

-----------------------------------------------------------------------------

Aaj:

5 February

-----------------------------------------------------------------------------

MongoDB:

Automatically Delete

=============================================================================
WHY TTL USE KARTE HAIN?
=============================================================================

Monitoring Data Bahut Fast Grow Karta Hai.

Example:

1000 requests/day

↓

30,000 requests/month

↓

360,000 requests/year

-----------------------------------------------------------------------------

Storage bahut expensive ho sakti hai.

TTL old data cleanup karta hai.

=============================================================================
MODEL CREATION
=============================================================================

const ApiHit = mongoose.model(
   "ApiHit",
   apiHitSchema
)

Schema ko actual MongoDB model me convert karta hai.

=============================================================================
EXPORT
=============================================================================

export default ApiHit

Dusri files me use karne ke liye.

=============================================================================
COMPLETE DATA FLOW
=============================================================================

Client App

↓

API Request

↓

Monitoring SDK

↓

POST /api/hit

↓

Authentication

↓

ApiKey Verify

↓

ApiHit Document Create

↓

MongoDB Save

↓

Analytics Pipeline

↓

Dashboard

=============================================================================
REAL DATABASE EXAMPLE
=============================================================================

{
   eventId:"evt_12345",

   timestamp:"2026-06-15T10:30:00Z",

   serviceName:"user-service",

   endpoint:"/api/users",

   method:"GET",

   statusCode:200,

   latencyMs:125,

   clientId:"6854abc123",

   apiKeyId:"6854key123",

   ip:"192.168.1.10",

   userAgent:"Axios/1.8.0"
}

=============================================================================
PROJECT ARCHITECTURE SO FAR
=============================================================================

Platform
   |
   +---- Client
            |
            +---- Users
            |
            +---- API Keys
                     |
                     +---- API Hits
                              |
                              +---- Analytics
                              |
                              +---- Reports
                              |
                              +---- Alerts

=============================================================================
MOST IMPORTANT CONCEPT
=============================================================================

ApiHit collection = Raw Events

Analytics collection = Aggregated Data

-----------------------------------------------------------------------------

Example:

Raw Events

100000 records

↓

Analytics Job

↓

Daily Summary

↓

1 record

-----------------------------------------------------------------------------

Isi technique se Datadog, New Relic, Grafana Cloud,
Elastic Observability aur Sentry jaise tools kaam karte hain.

Raw events directly dashboard me nahi dikhaye jate.

Pehle aggregate kiye jate hain.

=============================================================================
INTERVIEW ONE LINE ANSWER
=============================================================================

Ye ApiHit model monitoring system me har individual API request ka raw
event data store karta hai. Isme endpoint, service, status code,
latency, client, API key aur request metadata store hota hai jisse
analytics, alerting, reporting aur performance monitoring generate ki
ja sakti hai. Ye poore monitoring platform ka core data source hai.

=============================================================================
*/