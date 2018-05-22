import * as express from 'express';
import * as http from 'http';
import * as Passport from 'passport';
import * as PassportJWT from 'passport-jwt';

const app = express();
const port = normalizePort(443);

app.use('/', express.static("dist"));
app.use('/assets', express.static("dist/assets"));
app.use('/', express.static("dist"));
app.use('*', express.static("dist"));




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
    console.log("LISTENING")
}

function normalizePort(val: number|string): number|string|boolean {
    let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
}