import * as express from 'express';
import * as http from 'http';
import RoundController from './controllers/RoundCtrl'
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as Passport from 'passport'
import LoginCtrl from './controllers/LoginCtrl';
import UserCtrl from './controllers/UserCtrl';
import AuthUtils from './AuthUtils';
import GameCtrl from './controllers/GameCtrl';
import GameModel from '../shared/models/GameModel'
import TeamCtrl from './controllers/TeamCtrl';
import GamePlayCtrl from './controllers/GamePlayCtrl';
import FacilitationCtrl from './controllers/FacilitationCtrl';
import { Long } from 'bson';
import { LongPollCtrl } from './controllers/LongPollCtrl';
import LongPoll from '../shared/base-sapien/api/LongPoll'

export class AppServer {

    public static app = express();
    public static LongPoll = new LongPoll(AppServer.app);
    public static port = AppServer.normalizePort(80);
    public static router: express.Router = express.Router();
    public static httpServer = http.createServer(AppServer.app);

    private constructor(){}

    static onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') throw error;
        let bind = (typeof AppServer.port === 'string') ? 'Pipe ' + AppServer.port : 'Port ' + AppServer.port;

        console.log(error);

        switch (error.code) {
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

    static normalizePort(val: number | string): number | string | boolean {
        let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port)) return val;
        else if (port >= 0) return port;
        else return false;
    }



    public static StartServer() {

        AppServer.httpServer.listen(AppServer.port);
        AppServer.httpServer
            .on('error', AppServer.onError)
            .on('listening', AppServer.onListening);

    }

    static onListening(): void {

        const MONGO_URI: string = 'mongodb://localhost:27017/red-hat';
        mongoose.set('debug', true);

        var connection = mongoose.connect(MONGO_URI || process.env.MONGODB_URI).then((connection) => {
            //console.log(typeof connection, connection);
        }).catch((r) => {
            console.log(r);
        });


        const router: express.Router = express.Router();
        AppServer.app.use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json());

        AuthUtils.SET_UP_PASSPORT();

        /*
            setInterval( () => { 
                LP.publish("/sapien/api/gameplay/listenforgameadvance", {test: "might as well try an object for no good reason"})
            }, 5000);
        */
        AppServer.LongPoll.create("/listenforgameadvance/:gameid", (req, res, next) => {
            req.id = req.params.gameid;
            next();
        });

        //GZIP large resources in production
        if(process.env.NODE_ENV && process.env.NODE_ENV.indexOf("prod") != -1){

            AppServer.app
                .get('*.js', function (req, res, next) {
                    req.url = req.url + '.gz';
                    res.set('Content-Encoding', 'gzip');
                    res.set('Content-Type', 'text/javascript');                
                    console.log("GZIP ON: ", req.url)
                    next();
                })
                .get('*.css', function (req, res, next) {
                    req.url = req.url + '.gz';
                    res.set('Content-Encoding', 'gzip');
                    res.set('Content-Type', 'text/css');                
                    console.log("GZIP ON: ", req.url)
                    next();
                })

        }

        AppServer.app.use('/', AppServer.router)
            .use('/sapien/api/rounds', Passport.authenticate('jwt', { session: false }), RoundController)
            .use('/sapien/api/' + GameModel.REST_URL, GameCtrl)
            .use('/sapien/api/auth', LoginCtrl)
            .use('/sapien/api/team', TeamCtrl)
            .use('/sapien/api/user', UserCtrl)
            .use('/sapien/api/gameplay', Passport.authenticate('jwt', { session: false }), GamePlayCtrl)
            .post('/sapien/api/facilitation/round/:gameid', Passport.authenticate('jwt', { session: false }), (req, res) => {
                console.log(req.body)
                AppServer.LongPoll.publishToId("/listenforgameadvance/:gameid", req.params.gameid , req.body)
                res.json("long poll publish hit")
            })
            .use('/assets', express.static("dist/assets"))
            .use('/', express.static("dist"))
            .use('*', express.static("dist"))
            .use('**', express.static("dist"))

    }

}
