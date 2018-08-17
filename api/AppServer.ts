import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import RoundController, { monRoundModel, monSubRoundModel, monQModel } from './controllers/RoundCtrl'
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
import GamePlayCtrl, { monResponseModel, monSubRoundScoreModel } from './controllers/GamePlayCtrl';
import LongPoll from '../shared/base-sapien/api/LongPoll';
import RoundChangeMapping from '../shared/models/RoundChangeMapping';
import { JobName } from '../shared/models/UserModel';
import QuestionModel, { ComparisonLabel } from '../shared/models/QuestionModel';
import ResponseModel from '../shared/models/ResponseModel';
import RoundModel from '../shared/models/RoundModel';
import SubRoundModel from '../shared/models/SubRoundModel';
import * as fs from 'fs';
import SubRoundScore from '../shared/models/SubRoundScore';
import { SliderValueObj } from '../shared/entity-of-the-state/ValueObj';


export class AppServer {
    public static app = express();
    public static LongPoll = new LongPoll(AppServer.app);
    public static port: string | number | boolean;
    public static router: express.Router = express.Router();
    public static WebServer: http.Server | https.Server = AppServer.getServer()
    public static ForwardingServer: http.Server;

    private constructor() { }

    private static getServer(): http.Server | https.Server {
        try {
            if (AppServer._isProd()) {
                var privateKey = fs.readFileSync('/sapien/certificates/planetsapien.com/privkey.pem', 'utf8').toString();
                var certificate = fs.readFileSync('/sapien/certificates/planetsapien.com/fullchain.pem', 'utf8').toString();
                if (!privateKey || !certificate) throw new Error("no cert or key found");

                AppServer.port = AppServer.normalizePort(443);

                //set up server to forward insecure traffic to https
                const port = AppServer.normalizePort(80);
                const forwardApp = express();
                AppServer.ForwardingServer = http.createServer(forwardApp);
                AppServer.ForwardingServer.listen(port);
                forwardApp.get('*', (req, res) => {
                    console.log("HTTP INSECURE TRAFFIC");
                    res.redirect('https://' + req.headers.host + req.url);
                })

                return https.createServer({ key: privateKey, cert: certificate }, AppServer.app);
            } else {
                AppServer.port = AppServer.normalizePort(80);
                return http.createServer(AppServer.app);
            }
        }
        catch (err) {
            console.log(err)
        }
    }

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

    private static normalizePort(val: number | string): number | string | boolean {
        let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port)) return val;
        else if (port >= 0) return port;
        else return false;
    }

    public static StartServer() {
        AppServer.WebServer.listen(AppServer.port);
        AppServer.WebServer
            .on('error', AppServer.onError)
            .on('listening', AppServer.onListening);
    }

    private static _isProd(): boolean {
        return process.env.NODE_ENV && process.env.NODE_ENV.indexOf("prod") != -1;
    }

    private static onListening(): void {

        let MONGO_URI: string;
        if (AppServer._isProd()) {
            MONGO_URI = 'mongodb://mbreeden:F5aJyDx4F9Ly@localhost:27017/red-hat?authSource=admin'; //F5aJyDx4F9Ly
           // MONGO_URI = 'mongodb://localhost:27017/red-hat';
        } else {
            MONGO_URI = 'mongodb://localhost:27017/red-hat';
        }

        //mongoose.set('debug', true);
        var connection = mongoose.connect(MONGO_URI || process.env.MONGODB_URI).then((connection) => {
        }).catch((r) => {
            console.log(r);
        });

        const router: express.Router = express.Router();
        AppServer.app.use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json());

        AppServer._setRoundAndSubroundOrder();

        AuthUtils.SET_UP_PASSPORT();


        AppServer.LongPoll.create("/listenforgameadvance/:gameid", async (req, res, next) => {
            req.id = req.params.gameid;
            const game = await monGameModel.findById(req.id).then(r => r ? Object.assign(new GameModel(), r.toJSON()) : null);
            if (game) {
                if (!game.CurrentRound || !game.CurrentRound.ParentRound) {
                    next();
                } else if (!req.query  || req.query.force || !req.query.ParentRound || !req.query.ChildRound || req.query.ParentRound.toUpperCase() != game.CurrentRound.ParentRound.toUpperCase() || req.query.ChildRound.toUpperCase() != game.CurrentRound.ChildRound.toUpperCase()) {
                    res.json(game.CurrentRound);
                } else {
                    next();
                }
            } else {
                next();
            }
        }, {maxListeners: 500});

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
         });*/

        AppServer.app.use('/', AppServer.router)
            //Passport.authenticate('jwt', { session: false }),
            .use('/sapien/api/rounds', RoundController)
            .use('/sapien/api/' + GameModel.REST_URL, GameCtrl)
            .use('/sapien/api/auth', LoginCtrl)
            .use('/sapien/api/team', TeamCtrl)
            .use('/sapien/api/user', UserCtrl)
            .use('/sapien/api/gameplay', /*Passport.authenticate('jwt', { session: false }),*/ GamePlayCtrl)
            
            .post('/sapien/api/facilitation/round/:gameid', Passport.authenticate('jwt', { session: false }), async (req, res) => {
                console.log("HIT HERe", req.body);
                try {
                    const mapping: RoundChangeMapping = Object.assign(new RoundChangeMapping(), req.body);
                    const game: GameModel = await monGameModel.findById(req.params.gameid).populate("Teams").then(g => Object.assign(new GameModel(), g.toJSON()));

                    //Pick role for each player on each team
                    //TODO: get rid of magic string
                    mapping.UserJobs = {};

                    mapping.ParentRound = mapping.ParentRound.toLowerCase();
                    mapping.ChildRound = mapping.ChildRound.toLowerCase();

                    const round = await monRoundModel.findOne({ Name: mapping.ParentRound.toUpperCase() }).then(r => r.toJSON())
                    let RoundId = round._id;
                    mapping.RoundId = round._id;

                    //make sure the current mapping has the correct child round
                    var oldMapping: RoundChangeMapping = await monMappingModel.findOneAndUpdate({ GameId: game._id, ParentRound: mapping.ParentRound }, {
                        ChildRound: mapping.ChildRound,
                        ShowRateUsers: mapping.ShowRateUsers, // object where keys are user's _id as string & values are one of JobName enum values
                        ShowFeedback: mapping.ShowFeedback, // object where keys are user's _id as string & values are one of JobName enum values
                        ShowIndividualFeedback: mapping.ShowIndividualFeedback,
                        RoundId
                    }, { new: true }, function (err, doc) {
                        if (err) {

                            console.log("Something wrong when updating data!", err);
                        }
                    }).then(r => r ? Object.assign(new RoundChangeMapping(), r.toJSON()) : null);
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
                            game.Teams.forEach(t => {
                                console.log("TEAM ", t)
                                for (let i = 0; i < t.Players.length; i++) {
                                    let pid = t.Players[i].toString();
                                    if (game.HasBeenManager.indexOf(pid) == -1) {
                                        game.HasBeenManager.push(pid);
                                        mapping.UserJobs[pid] = JobName.MANAGER;
                                        console.log("HEY< YOU", pid, mapping)
                                        break;
                                    }
                                }

                                //make sure each team has a manager, even if all the team members have been manager 
                                if (t.Players.every(p => {
                                    console.log("examing", p, mapping.UserJobs[p._id.toString()])
                                    return mapping.UserJobs[p._id.toString()] != JobName.MANAGER
                                })) {
                                    console.log("DIDN'T FIND MANAGER FOR ", t)
                                    mapping.UserJobs[t.Players[Math.floor(Math.random() * t.Players.length)]._id.toString()] = JobName.MANAGER;
                                }

                            })
                        }

                        mapping.GameId = game._id;
                        var newMapping: RoundChangeMapping = await monMappingModel.create(mapping).then(r => Object.assign(new RoundChangeMapping(), r.toJSON()))
                    } else if (!oldMapping.UserJobs) {
                        game.Teams.forEach(t => {
                            for (let i = 0; i < t.Players.length; i++) {
                                let pid = t.Players[i].toString();
                                if (game.HasBeenManager.indexOf(pid) == -1) {
                                    game.HasBeenManager.push(pid);
                                    mapping.UserJobs[pid] = JobName.MANAGER;
                                    console.log("HEY< YOU", pid, mapping)
                                    break;
                                }
                            }

                            //make sure each team has a manager, even if all the team members have been manager 
                            if (t.Players.every(p => {
                                return mapping.UserJobs[p._id.toString()] != JobName.MANAGER
                            })) {
                                console.log("DIDN'T FIND MANAGER FOR ", t)
                                mapping.UserJobs[t.Players[0]._id.toString()] = JobName.MANAGER;
                            }

                        })
                    }





                    if ((!newMapping || !newMapping.ParentRound.length) && !oldMapping) {
                        throw new Error("Couldn't make mapping")
                    }
                    // Update Game object on DB



                    // Score calculating
                    if (mapping.ShowFeedback) {
                        //var Name = mapping.ChildRound.toUpperCase();
                        var subRounds: SubRoundModel[] = await monSubRoundModel.find({ RoundId: mapping.RoundId })
                            .populate("Questions")
                            .then(srs => srs.map(sr => Object.assign(new SubRoundModel(), sr.toJSON()))); //.then()

                        //we need the PREVIOUS subround

                        for (let j = 0; j < subRounds.length; j++) {
                            let subRound = subRounds[j];
                           
                            console.log("J BE J:", j)
                          
                            for (let i = 0; i < game.Teams.length; i++) {
                                let t = game.Teams[i];
                                //get the team's responses in this subround
                                const responses: ResponseModel[] = await monResponseModel.find({ TeamId: t._id, SubRoundId: subRound._id }).then(rs => rs ? rs.map(r => Object.assign(new ResponseModel(), r.toJSON())) : null)
                                let questions = subRound.Questions;

                                let MaxRawScore = 0;
                                let RawScore = 0;

                                questions.forEach(q => {
                                    let relevantResponses = responses.filter(r => /*!r.SkipScoring && */ r.QuestionId == q._id.toString());
                                    relevantResponses.forEach(r => {
                                        RawScore += r.Score;
                                        if(r.MaxScore) MaxRawScore = r.MaxScore;                               
                                    });
                                    ((q.PossibleAnswers as SliderValueObj[]).forEach(a => {
                                        if (a.maxPoints) MaxRawScore += a.maxPoints;
                                    }))
                                })

                                let srs = Object.assign(new SubRoundScore(), {
                                    TeamId: t._id,
                                    RawScore,
                                    MaxRawScore,
                                    GameId: game._id,
                                    RoundId: subRound.RoundId,
                                    SubRoundId: subRound._id,
                                    SubRoundLabel: subRound.Label,
                                    RoundLabel: round.Label,
                                    TeamLabel: "Team " + t.Number.toString()
                                });

                                if(RawScore > 0 ){
                                    srs.NormalizedScore = RawScore / MaxRawScore * 20 / subRounds.length;
                                } else {
                                    srs.NormalizedScore = 0;
                                }

                                var savedSubRoundScore: SubRoundScore = await monSubRoundScoreModel.findOneAndUpdate( { TeamId: t._id, SubRoundId: subRound._id }, srs, { upsert: true, new: true, setDefaultsOnInsert: true })
                                    .then(sr => Object.assign(new SubRoundScore(), sr.toJSON()));
                                    
                            }
                        }
                    }

                    var mapperydoo = (newMapping && newMapping.ParentRound.length) ? newMapping : oldMapping;
                    const gameSave = await monGameModel.findByIdAndUpdate(req.params.gameid, { CurrentRound: mapperydoo, HasBeenManager: game.HasBeenManager });
                    if (gameSave) {
                        AppServer.LongPoll.publishToId("/listenforgameadvance/:gameid", req.params.gameid, mapperydoo);
                        res.json("long poll publish hit");
                    }

                }
                catch (err) {
                    console.log(err)
                    res.send(err)
                }
            })
            .use('/assets', express.static("dist/assets"))
            .use('/', express.static("dist"))
            .use('*', express.static("dist"))
            .use('**', express.static("dist"))
    }

    private static async _setRoundAndSubroundOrder() {
        try {
            //do rounds
            const rounds: RoundModel[] = await monRoundModel.find()
                .populate("SubRounds")
                .populate(
                    {
                        path: "PrevRound",
                        populate: {
                            path: "SubRounds"
                        }
                    }
                )
                .populate(
                    {
                        path: "NextRound",
                        populate: {
                            path: "SubRounds"
                        }
                    }
                )
                .then(rs => rs ? rs.map(r => Object.assign(new RoundModel(), r.toJSON())) : null);

            console.log("<<<<<<<<<<<ROUNDS>>>>>>>>>>>>>>>>>>>>>", rounds)
            let letters = ["A", "B", "C", "D", "E"]
            for (let i = 0; i < rounds.length; i++) {
                let r = rounds[i];

                for (let j = 0; j < r.SubRounds.length; j++) {
                    let sr = r.SubRounds[j];

                    if (j == 0) {
                        if (!r.PrevRound) {
                            sr.PrevSubRound = null;
                        } else {
                            let prevSubrounds = r.PrevRound.SubRounds;
                            sr.PrevSubRound = prevSubrounds ? prevSubrounds[prevSubrounds.length - 1]._id : null;
                        }            
                        sr.NextSubRound = r.SubRounds[j + 1] ? r.SubRounds[j + 1]._id : null;
                    } else if (j == r.SubRounds.length - 1) {
                        sr.PrevSubRound = r.SubRounds[j - 1] ? r.SubRounds[j - 1]._id : null;

                        if(r.NextRound){
                            let nextRound = r.NextRound;
                            sr.NextSubRound = nextRound.SubRounds[0]._id;
                        } else {
                            sr.NextSubRound = null;
                        }

                    } else {
                        sr.NextSubRound = r.SubRounds[j + 1] ? r.SubRounds[j + 1]._id : null;
                        sr.PrevSubRound = r.SubRounds[j - 1] ? r.SubRounds[j - 1]._id : null;
                    }

                    sr.Label = r.Label + letters[j];

                    const savedSr = await monSubRoundModel.findByIdAndUpdate(sr._id, sr);
                    if (!savedSr) throw new Error(JSON.stringify({ message: "Couldn't save subround: ", sr }));

                }

            }

        }
        catch (err) {
            console.log(JSON.parse(err))
        }
    }

}
