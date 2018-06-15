import * as express from 'express';
import * as http from 'http';
import RoundController from './controllers/RoundCtrl'
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as Passport from 'passport'
import * as PassportJWT from 'passport-jwt';
import * as PassportLocal from 'passport-local';
import * as jwt from 'jsonwebtoken';
import LoginCtrl from './controllers/LoginCtrl';
import UserCtrl from './controllers/UserCtrl';
import AuthUtils from './AuthUtils';
import GameCtrl from './controllers/GameCtrl';

const app = express();
const port = normalizePort(80);
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

    const MONGO_URI: string = 'mongodb://localhost:27017/red-hat';
    mongoose.set('debug', true);
    
    var connection = mongoose.connect(MONGO_URI || process.env.MONGODB_URI).then((connection) => {
        console.log(typeof connection, connection);

    }).catch((r) => {
        console.log(r);
    });


    const router: express.Router = express.Router();
    app.use(bodyParser.urlencoded({ extended: true }))
    
    .use((req, res, next) => {
        //console.log("HEADERS: ", PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(), PassportJWT.ExtractJwt.fromHeader("auth"));
        next();
    })
    .use(bodyParser.json());

    AuthUtils.SET_UP_PASSPORT();
    app.use('/', router)
        .use('/sapien/api/rounds', Passport.authenticate('jwt', {session: false}), RoundController)
        .use('/sapien/api/games', GameCtrl)
        .use('/sapien/api/auth', LoginCtrl)
        .use('/sapien/api/user', UserCtrl )
        .use('/assets', express.static("dist/assets"))
        .use('/', express.static("dist"))
        .use('*', express.static("dist"))
        .use('**', express.static("dist"))

        // Passport.authenticate('jwt', {session: false}),
}

function normalizePort(val: number|string): number|string|boolean {
    let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
}