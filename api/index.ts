import * as express from 'express';
import * as http from 'http';
import * as Passport from 'passport';
import * as PassportJWT from 'passport-jwt';
import RoundController from './controllers/RoundCtrl'
import * as mongoose from 'mongoose';

const app = express();
const port = normalizePort(443);

const httpServer = http.createServer(app);
httpServer.listen(port);
httpServer
    .on('error', onError)
    .on('listening', onListening);

function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;

    console.log(error);

    switch(error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(): void {
    console.log("LISTENING");

    const MONGO_URI: string = 'mongodb://mbreeden:MUfC9ex6CWRwktBf@localhost:27017/red-hat?authSource=admin';
    mongoose.connect(MONGO_URI || process.env.MONGODB_URI);

    const router: express.Router = express.Router();

    app.use('/', router)
        .use('/sapien/api/rounds', RoundController)
        .use('/', express.static("dist"))
        .use('/assets', express.static("dist/assets"))
        .use('/', express.static("dist"))
}

function normalizePort(val: number|string): number|string|boolean {
    let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
}