



// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';

// import config from './shared/config/index.js';

// import logger from './shared/config/logger.js';

// import mongodb from './shared/config/mongodb.js';
// import postgres from './shared/config/postgres.js';
// import rabbitmq from './shared/config/rabbitmq.js';

// import errorHandler from './shared/middlewares/errorHandler.js';

// import ResponseFormatter from './shared/utils/ResponseFormatter.js';
// import cookieParser from "cookie-parser";

// // Routers
// import authRouter from "./services/auth/routes/authRouter.js";

// /**
//  * Initialize Express app
//  */
// const app = express();
// app.use(cookieParser());

// /**
//  * Middlewares
//  */
// app.use(helmet());

// app.use(cors({
//     origin: true,
//     credentials: true
// }));

// app.use(express.json());

// app.use(express.urlencoded({
//     extended: true
// }));

// /**
//  * Request Logger Middleware
//  */
// app.use((req, res, next) => {
//     logger.info(`${req.method} ${req.path}`, {
//         ip: req.ip,
//         userAgent: req.headers['user-agent']
//     });

//     next();
// });

// /**
//  * Root Route
//  */
// app.get('/', (req, res) => {
//     res.status(200).json(
//         ResponseFormatter.success(
//             {
//                 service: 'API Hit Monitoring System',
//                 version: '1.0.0',
//                 endpoints: {
//                     health: '/health',
//                     auth: '/api/auth',
//                     ingest: '/api/hit',
//                     analytics: '/api/analytics'
//                 }
//             },
//             'API Hit Monitoring Service'
//         )
//     );
// });

// /**
//  * Health Check Route
//  */
// app.get('/health', (req, res) => {
//     res.status(200).json(
//         ResponseFormatter.success(
//             {
//                 status: 'healthy',
//                 uptime: process.uptime(),
//                 timestamp: new Date().toISOString(),
//                 rabbitmq: rabbitmq.getStatus()
//             },
//             'Service is healthy'
//         )
//     );
// });


// /**
//  * API Routes
//  */
// app.use("/api/auth", authRouter);



// /**
//  * 404 Handler
//  */
// app.use((req, res) => {
//     res.status(404).json(
//         ResponseFormatter.error(
//             'Endpoint not found',
//             404
//         )
//     );
// });

// /**
//  * Global Error Handler
//  */
// app.use(errorHandler);




// /**
//  * Initialize All Connections
//  */
// async function initializeConnection() {
//     try {
//         logger.info('Initializing database connections...');

//         /**
//          * MongoDB Connection
//          */
//         await mongodb.connect();

//         /**
//          * PostgreSQL Connection
//          */
//         await postgres.testConnection();

//         /**
//          * RabbitMQ Connection
//          */
//         await rabbitmq.connect();

//         logger.info('All connections established successfully');

//     } catch (error) {

//         logger.error('Failed to initialize connections:', error);

//         throw error;
//     }
// }

// /**
//  * Graceful Shutdown
//  */
// async function gracefulShutdown(signal, server) {

//     logger.info(`${signal} received. Shutting down gracefully...`);

//     server.close(async () => {

//         logger.info('HTTP server closed');

//         try {

//             await mongodb.disconnect();

//             await postgres.close();

//             await rabbitmq.close();

//             logger.info('All connections closed successfully');

//             process.exit(0);

//         } catch (error) {

//             logger.error('Error during shutdown:', error);

//             process.exit(1);
//         }
//     });

//     setTimeout(() => {

//         logger.error('Forced shutdown');

//         process.exit(1);

//     }, 10000);
// }

// /**
//  * Start Server
//  */
// async function startServer() {

//     try {

//         await initializeConnection();

//         const PORT = config.port || 8001;

//         const server = app.listen(PORT, () => {

//             logger.info(`Server started on port ${PORT}`);

//             logger.info(`Environment: ${config.node_env}`);

//             logger.info(`API available at: http://localhost:${PORT}`);
//         });

//         /**
//          * Process Handlers
//          */
//         process.on('SIGTERM', () =>
//             gracefulShutdown('SIGTERM', server)
//         );

//         process.on('SIGINT', () =>
//             gracefulShutdown('SIGINT', server)
//         );

//         process.on('uncaughtException', (error) => {

//             logger.error('Uncaught Exception:', error);

//             gracefulShutdown('uncaughtException', server);
//         });

//         process.on('unhandledRejection', (reason, promise) => {

//             logger.error('Unhandled Rejection:', {
//                 promise,
//                 reason
//             });

//             gracefulShutdown('unhandledRejection', server);
//         });

//     } catch (error) {

//         logger.error('Failed to start server:', error);

//         process.exit(1);
//     }
// }

// /**
//  * Boot Server
//  */
// startServer();







import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './shared/config/index.js';
import logger from './shared/config/logger.js';
import mongodb from './shared/config/mongodb.js';
import postgres from './shared/config/postgres.js';
import rabbitmq from './shared/config/rabbitmq.js';
import errorHandler from './shared/middlewares/errorHandler.js';
import ResponseFormatter from './shared/utils/responseFormatter.js';
import cookieParser from "cookie-parser"

// Routers
import authRouter from "./services/auth/routes/authRouter.js";
// import clientRouter from './services/client/routes/clientRoutes.js';
// import ingestRouter from "./services/ingest/routes/ingestRoutes.js"
// import analyticsRouter from "./services/analytics/routes/analyticsRoutes.js"

/**
 * Initialize Express app
 */
const app = express();

/**
 * Middlewares
 */
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware
 * Logs the HTTP method, path, IP address, and user agent for each incoming request.
 */
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
    next()
})

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
            'Service is healthy'
        )
    );
});

/**
 * Root endpoint
 * Provides basic information about the API service and available endpoints.
 */
app.get("/", (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                service: 'API Hit Monitoring System',
                version: '1.0.0',
                endpoints: {
                    health: '/health',
                    auth: '/api/auth',
                    ingest: '/api/hit',
                    analytics: '/api/analytics',
                },
            },
            'API Hit Monitoring Service'
        )
    )
});

/**
 * API Routes
 */
app.use("/api/auth", authRouter);
// app.use("/api/hit", ingestRouter);
// app.use("/api/analytics", analyticsRouter)
// app.use("/api", clientRouter)

/**
 * 404 Handler
 */
app.use((req, res) => {
    res.status(404).json(ResponseFormatter.error("Endpoint not found", 404))
})

app.use(errorHandler)

/**
 * Initialize database connections and start the server
 */
async function initializeConnection() {
    try {
        logger.info("Initializing database connections...");

        // Connect to MongoDB;
        await mongodb.connect();

        // Connect to PG;
        await postgres.testConnection();

        // Connect to RabbitMQ;
        await rabbitmq.connect();

        logger.info("All connections established successfully");
    } catch (error) {
        logger.error("Failed to initialize connections:", error);
        throw error;
    }
}

/**
 * Start the Express server after establishing database connections.
 * Also sets up graceful shutdown handlers for SIGINT and SIGTERM signals.
 * On shutdown, it closes the HTTP server and all database connections before exiting the process.
 * If any error occurs during startup or shutdown, it logs the error and exits with a non-zero status code.
 */
async function startServer() {
    try {
        await initializeConnection();

        const server = app.listen(config.port, () => {
            logger.info(`Server started on port ${config.port}`);
            logger.info(`Environment: ${config.node_env}`);
            logger.info(`API available at: http://localhost:${config.port}`);
        });


        const gracefulShutdown = async (signal) => {
            logger.info(`${signal} received, shutting down gracefully...`);

            server.close(async () => {
                logger.info("HTTP server closed");

                try {
                    await mongodb.disconnect();
                    await postgres.close();
                    await rabbitmq.close();
                    logger.info('All connections closed, exiting process');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown:', error);
                    process.exit(1);
                }
            })

            setTimeout(() => {
                logger.error("Forced shutdown")
                process.exit(1);
            }, 10000);

        }

        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('unhandledRejection');
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer()























/*
=============================================================================
SERVER.JS COMPLETE FLOW EXPLANATION (BEGINNER HINGLISH NOTES)
=============================================================================

Ye file poore backend application ka main entry point hai.

Simple language me:

Jab hum:

npm run dev

chalate hain to sabse pehle ye file execute hoti hai.

Is file ka kaam hai:

1. Express Server banana
2. Security Middleware lagana
3. Request Parsing setup karna
4. Request Logging setup karna
5. Routes register karna
6. MongoDB connect karna
7. PostgreSQL connect karna
8. RabbitMQ connect karna
9. Error Handling setup karna
10. Server start karna
11. Graceful Shutdown handle karna

=============================================================================
STEP 1 : IMPORTS
=============================================================================

express
-> Backend server banane ke liye.

cors
-> Frontend aur backend ko alag domains se communicate karne deta hai.

helmet
-> Security headers add karta hai aur common attacks se protect karta hai.

config
-> .env aur project configuration access karne ke liye.

logger
-> Console.log ki jagah professional logging system.

mongodb
-> MongoDB database connection manage karta hai.

postgres
-> PostgreSQL database connection manage karta hai.

rabbitmq
-> RabbitMQ queue connection manage karta hai.

errorHandler
-> Global error handling middleware.

ResponseFormatter
-> Har API response ko same structure me return karne ke liye.

cookieParser
-> Browser se aane wali cookies read karne ke liye.

authRouter
-> Authentication related routes handle karega.

=============================================================================
STEP 2 : EXPRESS APP CREATE KARNA
=============================================================================

const app = express();

Yaha Express application create hoti hai.

Ye object poore backend ko represent karta hai.

Saare routes, middlewares aur APIs isi app object par register hote hain.

=============================================================================
STEP 3 : GLOBAL MIDDLEWARES
=============================================================================

app.use(helmet())

Security layer.

Automatically kuch security headers add karta hai.

-----------------------------------------------------------------------------

app.use(cors())

Frontend aur backend ko communication allow karta hai.

credentials:true

ka matlab cookies bhi allow hongi.

-----------------------------------------------------------------------------

app.use(cookieParser())

Incoming request ki cookies parse karta hai.

Example:

Cookie:
token=abc123

To req.cookies.token se access kar sakte hain.

-----------------------------------------------------------------------------

app.use(express.json())

JSON request body parse karta hai.

Example:

{
  "email":"test@gmail.com"
}

Ye req.body me convert ho jayega.

-----------------------------------------------------------------------------

app.use(express.urlencoded())

Form-data ko parse karta hai.

Mostly HTML forms ke liye use hota hai.

=============================================================================
STEP 4 : REQUEST LOGGER
=============================================================================

Har request ke aane par execute hota hai.

Example:

GET /api/auth/profile

Logger store karega:

Method
Path
IP Address
User Agent

Ye monitoring aur debugging ke liye bahut useful hai.

next()

Bolta hai ki middleware complete ho gaya hai.

Ab next middleware ya route execute karo.

=============================================================================
STEP 5 : HEALTH CHECK ROUTE
=============================================================================

GET /health

Purpose:

Server alive hai ya nahi check karna.

Return karta hai:

status
timestamp
uptime

Monitoring tools isi endpoint ko hit karke check karte hain
ki service chal rahi hai ya down hai.

=============================================================================
STEP 6 : ROOT ROUTE
=============================================================================

GET /

Backend ki basic information return karta hai.

User ko batata hai:

Service Name
Version
Available APIs

Ye ek welcome endpoint ki tarah kaam karta hai.

=============================================================================
STEP 7 : API ROUTES REGISTER KARNA
=============================================================================

app.use("/api/auth", authRouter)

Matlab:

Auth router ke saare routes

/api/auth

ke niche available honge.

Example:

POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile

Future me:

/api/hit
/api/analytics
/api/client

bhi add honge.

=============================================================================
STEP 8 : 404 HANDLER
=============================================================================

Agar koi route exist nahi karta.

Example:

GET /random-api

To ye middleware chalega.

Response:

404 Endpoint Not Found

Isse user ko proper error milta hai.

=============================================================================
STEP 9 : GLOBAL ERROR HANDLER
=============================================================================

app.use(errorHandler)

Project me kahi bhi error throw ho.

To finally yahi middleware us error ko catch karega.

Benefits:

Server crash nahi hota.

User ko proper error response milta hai.

=============================================================================
STEP 10 : DATABASE INITIALIZATION
=============================================================================

initializeConnection()

Server start hone se pehle:

1. MongoDB Connect
2. PostgreSQL Connect
3. RabbitMQ Connect

kiya jata hai.

Agar inme se koi bhi fail hua:

Server start nahi hoga.

Ye production level best practice hai.

=============================================================================
STEP 11 : START SERVER
=============================================================================

startServer()

Main startup function hai.

Flow:

1. initializeConnection()
2. Databases connect
3. Queue connect
4. HTTP server start

-----------------------------------------------------------------------------

app.listen(config.port)

Server specified port par requests sunna start karta hai.

Example:

http://localhost:5000

=============================================================================
STEP 12 : GRACEFUL SHUTDOWN
=============================================================================

Bahut important production concept.

Jab server band hota hai:

Ctrl + C

ya

Docker Stop

ya

Server Restart

tab direct process kill nahi ki jati.

Pehle:

1. New requests stop
2. Existing requests complete
3. MongoDB close
4. PostgreSQL close
5. RabbitMQ close
6. Process exit

Is process ko Graceful Shutdown kehte hain.

=============================================================================
STEP 13 : SIGINT
=============================================================================

CTRL + C press karne par signal aata hai.

Process ko politely shutdown kiya jata hai.

=============================================================================
STEP 14 : SIGTERM
=============================================================================

Cloud providers aur Docker usually SIGTERM bhejte hain.

Server safely shutdown hota hai.

=============================================================================
STEP 15 : FORCED SHUTDOWN
=============================================================================

setTimeout(10000)

Agar 10 seconds tak shutdown complete nahi hua.

To forcefully process exit kar diya jayega.

Taaki hanging process na rahe.

=============================================================================
STEP 16 : UNCAUGHT EXCEPTION
=============================================================================

Aisi error jo try-catch ke bahar reh gayi.

Example:

undefined.someMethod()

Ye application crash kar sakta hai.

Isliye catch karke graceful shutdown kiya jata hai.

=============================================================================
STEP 17 : UNHANDLED REJECTION
=============================================================================

Promise reject hua lekin catch nahi lagaya.

Example:

await someAsyncFunction()

Aur error handle nahi hua.

Ye event us error ko catch karega.

=============================================================================
FINAL ARCHITECTURE FLOW
=============================================================================

Client
   |
   v
Express Server
   |
   +--> Helmet Security
   |
   +--> CORS
   |
   +--> Cookie Parser
   |
   +--> JSON Parser
   |
   +--> Request Logger
   |
   +--> Routes
            |
            +--> Auth APIs
            +--> Hit APIs (Future)
            +--> Analytics APIs (Future)
   |
   +--> Error Handler
   |
   +--> MongoDB
   |
   +--> PostgreSQL
   |
   +--> RabbitMQ
   |
   +--> Graceful Shutdown System

=============================================================================
INTERVIEW ONE LINE ANSWER
=============================================================================

Ye file poore API Monitoring System ka bootstrap file hai jo
Express server initialize karta hai, middlewares configure karta hai,
routes register karta hai, MongoDB/PostgreSQL/RabbitMQ connections establish
karta hai, error handling setup karta hai aur production-grade graceful
shutdown mechanism ke saath application ko start karta hai.
=============================================================================
*/