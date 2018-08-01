import * as express from 'express';
import * as http from 'http';
import RoundController from './controllers/RoundCtrl'
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as Passport from 'passport'
import LoginCtrl from './controllers/LoginCtrl';
import { monMappingModel } from './controllers/GameCtrl';
import UserCtrl from './controllers/UserCtrl';
import AuthUtils from './AuthUtils';
import GameCtrl, { monGameModel } from './controllers/GameCtrl';
import GameModel from '../shared/models/GameModel'
import TeamCtrl from './controllers/TeamCtrl';
import GamePlayCtrl from './controllers/GamePlayCtrl';
import LongPoll from '../shared/base-sapien/api/LongPoll';
import RoundChangeMapping from '../shared/models/RoundChangeMapping';
import { JobName } from '../shared/models/UserModel';
import QuestionModel, { ComparisonLabel } from '../shared/models/QuestionModel';
import ResponseModel from '../shared/models/ResponseModel';

export class AppServer
{
    public static app = express();
    public static LongPoll = new LongPoll(AppServer.app);
    public static port = AppServer.normalizePort(80);
    public static router: express.Router = express.Router();
    public static httpServer = http.createServer(AppServer.app);

    private constructor() { }

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

        
        /*AppServer.LongPoll.create("/listenforgameadvance/:gameid", async (req, res, next) => {
            req.id = req.params.gameid;
            const game = await monGameModel.findById(req.id).then(r => r ? Object.assign(new GameModel(), r.toJSON()) : null);
            
            if (game) {
               if (!game.CurrentRound || !game.CurrentRound.ParentRound) {
                   next();
               } else if (!req.query || req.query.ParentRound != game.CurrentRound.ParentRound || req.query.ChildRound != game.CurrentRound.ChildRound) {
                   res.json(game.CurrentRound);
               } else {
                   next();
               }
            } else {
                next();
            }
        });*/
       
        //GZIP large resources in production
        /*
        console.log("ENVIRONMENT IS:", process.env.NODE_ENV)
        if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf("prod") != -1) {
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
        */
        AppServer.app.get("/listenforgameadvance/:gameid", async (req, res, next) => {
            const gameId = req.params.gameid;
            try {
                const game = await monGameModel.findById(gameId).then(r => r ? Object.assign(new GameModel(), r.toJSON()) : null);
                if (game) { 
                    res.json(game.CurrentRound);
                }
            } catch(err) {
                console.log(err);
            }
        });

        AppServer.app.use('/', AppServer.router)
            .use('/sapien/api/rounds', RoundController)
            .use('/sapien/api/' + GameModel.REST_URL, GameCtrl)
            .use('/sapien/api/auth', LoginCtrl)
            .use('/sapien/api/team', TeamCtrl)
            .use('/sapien/api/user', UserCtrl)
            .use('/sapien/api/gameplay', /*Passport.authenticate('jwt', { session: false }),*/ GamePlayCtrl)
            .post('/sapien/api/facilitation/round/:gameid', Passport.authenticate('jwt', { session: false }), async (req, res) => {
                console.log("HIT HERe",req.body);
                try {
                    const mapping: RoundChangeMapping = Object.assign(new RoundChangeMapping(), req.body);
                    const game: GameModel = await monGameModel.findById(req.params.gameid).populate("Teams").then(g => Object.assign(new GameModel(), g.toJSON()));
                    //Pick role for each player on each team
                    //TODO: get rid of magic string
                    mapping.UserJobs = {};

                    mapping.ParentRound = mapping.ParentRound.toLowerCase();
                    mapping.ChildRound = mapping.ChildRound.toLowerCase();

                    //make sure the current mapping has the correct child round
                    var oldMapping: RoundChangeMapping = await monMappingModel.findOneAndUpdate({ GameId: game._id, ParentRound: mapping.ParentRound }, {
                        ChildRound: mapping.ChildRound,
                        ShowRateUsers: mapping.ShowRateUsers, // object where keys are user's _id as string & values are one of JobName enum values
                        ShowFeedback: mapping.ShowFeedback, // object where keys are user's _id as string & values are one of JobName enum values
                        ShowIndividualFeedback: mapping.ShowIndividualFeedback
                    }, {new: true}, function(err, doc){
                        if(err){

                            console.log("Something wrong when updating data!", err);
                        }} ).then(r => r ? Object.assign(new RoundChangeMapping(), r.toJSON()) : null);
                    console.log("OLD MAPPING",oldMapping);
                    if (!oldMapping) {
                        if (mapping.ParentRound.toLowerCase() == "engineeringround") {
                            game.Teams.forEach(t => {
                                var managerAssigned = false;
                                for (let i = 0; i < t.Players.length; i++) {
                                    let pid = t.Players[i].toString();
                                    console.log(typeof pid, pid)
                                    if (game.HasBeenManager.indexOf(pid) == -1 && !managerAssigned) {
                                        game.HasBeenManager.push(pid);
                                        mapping.UserJobs[pid] = JobName.MANAGER;
                                        managerAssigned = true;
                                    } else {
                                        mapping.UserJobs[pid] = i % 2 ? JobName.INTEGRATED_SYSTEMS : JobName.CHIPCO;
                                    }
                                }
                            })
                        } else {
                            console.log("BUILDING MAPPING");
                            game.Teams.forEach(t => {
                                console.log("TEAM ", t)
                                for (let i = 0; i < t.Players.length; i++) {
                                    let pid = t.Players[i].toString();
                                    if (game.HasBeenManager.indexOf(pid) == -1) {
                                        game.HasBeenManager.push(pid);
                                        mapping.UserJobs[pid] = JobName.MANAGER;
                                        console.log("HEY< YOU",pid, mapping)
                                        break;
                                    }
                                }

                                //make sure each team has a manager, even if all the team members have been manager 
                                if(t.Players.every(p => {
                                    console.log("examing", p,mapping.UserJobs[p._id.toString()])
                                    return mapping.UserJobs[p._id.toString()] != JobName.MANAGER
                                })){
                                    console.log("DIDN'T FIND MANAGER FOR ", t)
                                    mapping.UserJobs[t.Players[Math.floor(Math.random() * t.Players.length) + 1]._id.toString()] = JobName.MANAGER;
                                }

                            })
                        }

                        mapping.GameId = game._id;
                        var newMapping:RoundChangeMapping = await monMappingModel.create(mapping).then(r => Object.assign(new RoundChangeMapping(), r.toJSON()))
                    } else if(!oldMapping.UserJobs) {
                        game.Teams.forEach(t => {
                            console.log("TEAM ", t)
                            for (let i = 0; i < t.Players.length; i++) {
                                let pid = t.Players[i].toString();
                                if (game.HasBeenManager.indexOf(pid) == -1) {
                                    game.HasBeenManager.push(pid);
                                    mapping.UserJobs[pid] = JobName.MANAGER;
                                    console.log("HEY< YOU",pid, mapping)
                                    break;
                                }
                            }

                            //make sure each team has a manager, even if all the team members have been manager 
                            if(t.Players.every(p => {
                                console.log("examing", p,mapping.UserJobs[p._id.toString()])
                                return mapping.UserJobs[p._id.toString()] != JobName.MANAGER
                            })){
                                console.log("DIDN'T FIND MANAGER FOR ", t)
                                mapping.UserJobs[t.Players[0]._id.toString()] = JobName.MANAGER;
                            }

                        })
                    }

                    if (( !newMapping || !newMapping.ParentRound.length ) && !oldMapping) {
                        throw new Error("Couldn't make mapping")
                    }
                    // Update Game object on DB
                    var mapperydoo = (newMapping && newMapping.ParentRound.length) ? newMapping : oldMapping;
                    const gameSave = await monGameModel.findByIdAndUpdate(req.params.gameid, { CurrentRound: mapperydoo, HasBeenManager: game.HasBeenManager });
                    if (gameSave) {
                        //AppServer.LongPoll.publishToId("/listenforgameadvance/:gameid", req.params.gameid, mapperydoo);
                        res.json("long poll publish hit");
                    }
                }
                catch(err) {
                    console.log(err)
                    res.send(err)
                }
            })
            .use('/assets', express.static("dist/assets"))
            .use('/', express.static("dist"))
            .use('*', express.static("dist"))
            .use('**', express.static("dist"))
    }
/**
 * 
 * {
    "_id" : ObjectId("5b5618fc176b81cae6bacabc"),
    "Type" : "SLIDER",
    "Text" : "Quantity",
    "SubText" : null,
    "PossibleAnswers" : [ 
        {
            "label" : "",
            "data" : "",
            "min" : 200,
            "max" : 400,
            "interval" : 10,
            "unit" : "k users"
        }
    ]
}

{
    "_id" : ObjectId("5b563b10e09494dbc165dea3"),
    "Type" : "SLIDER",
    "Text" : "Price",
    "SubText" : "",
    "PossibleAnswers" : [ 
        {
            "label" : "",
            "data" : "",
            "min" : 100,
            "max" : 180,
            "interval" : 10,
            "unit" : "M",
            "preunit" : "$"
        }
    ]
}

{
    "_id" : ObjectId("5b564603e09494dbc165e273"),
    "Type" : "TOGGLE",
    "Text" : "Unlimited licensing",
    "SubText" : null,
    "PossibleAnswers" : [ 
        {
            "label" : "$200M",
            "data" : "200"
        }
    ]
}

{
    "_id" : ObjectId("5b564afee09494dbc165e40a"),
    "Type" : "MULTIPLE_CHOICE",
    "Text" : "Project Management",
    "SubText" : "In order to meet the customer budget, you can choose to omit project management from the given solution.",
    "PossibleAnswers" : [ 
        {
            "label" : "Yes",
            "data" : "1"
        }, 
        {
            "label" : "No",
            "data" : "0"
        }
    ]
}
 */
    GetScore(subRoundName, responses: ResponseModel[]){
        subRoundName.toUpperCase();
        switch(subRoundName){
    
            case "DEALSTRUCTURE":
            case "DEALRENEWAL":
                let comparitors;
                responses.forEach(r => {
                    //(q.Response.Answer as SliderValueObj)
                    if(r.ComparisonLabel)comparitors[r.ComparisonLabel] = r;
                })
                var price = 0;
                if(comparitors[ComparisonLabel.QUANTITY] && comparitors[ComparisonLabel.PRICE]){
                    responses[0].Score = comparitors[ComparisonLabel.QUANTITY] / comparitors[ComparisonLabel.PRICE];

                }
    
        }
    }

}
