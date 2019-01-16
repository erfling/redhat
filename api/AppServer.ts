import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import RoundController, { monRoundModel, monSubRoundModel, monQModel, monMessageModel } from './controllers/RoundCtrl'
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as Passport from 'passport'; 
import LoginCtrl from './controllers/LoginCtrl';
import { monMappingModel } from './controllers/GameCtrl';
import UserCtrl from './controllers/UserCtrl';
import AuthUtils from './AuthUtils';
import GameCtrl, { monGameModel } from './controllers/GameCtrl';
import GameModel from '../shared/models/GameModel'
import TeamCtrl, { monTeamModel } from './controllers/TeamCtrl';
import GamePlayCtrl, { monResponseModel, monSubRoundScoreModel } from './controllers/GamePlayCtrl';
import LongPoll from '../shared/base-sapien/api/LongPoll';
import RoundChangeMapping from '../shared/models/RoundChangeMapping';
import UserModel, { JobName } from '../shared/models/UserModel';
import QuestionModel, { ComparisonLabel, RatingType } from '../shared/models/QuestionModel';
import ResponseModel from '../shared/models/ResponseModel';
import RoundModel from '../shared/models/RoundModel';
import SubRoundModel from '../shared/models/SubRoundModel';
import * as fs from 'fs';
import SubRoundScore from '../shared/models/SubRoundScore';
import { SliderValueObj } from '../shared/entity-of-the-state/ValueObj';
import MessageModel from '../shared/models/MessageModel';
import RoundChangeLookup from '../shared/models/RoundChangeLookup';
import FacilitationCtrl, { monRoundChangeLookupModel } from './controllers/FacilitationCtrl';
import GamePlayUtilities from './GamePlayUtils'

class SubRoundNormalizationRule
{
    public RoundId:string;
    public SubRoundId:string;
    public Label: string;
    public weight: Number;
}


 class  SubRoundNormalizationInfo {
    
    //----------------------------------------------------------------------
	//
	//  Properties
	//
	//----------------------------------------------------------------------
		
    static readonly MAX_SCORE_ROUND = 20;

    public static RoundWeights: SubRoundNormalizationRule[] = [{ RoundId:"1", SubRoundId:'a',  Label: '1a', weight: .2 },
     {RoundId:"1", SubRoundId:'b', Label: '1b', weight: .8 }];
    
    
    
}

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
        AppServer.setMessageRoundLabels();
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
 
        console.log("ENVIRONMENT IS:", process.env.NODE_ENV)
        /*
        if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf("prod") != -1) {
            AppServer.app
                .get('*.js', function (req, res, next) {
                    if(req.url.endsWith("/")) req.url = req.url.slice(0, -1);
                    req.url = req.url + '.gz';
                    res.set('Content-Encoding', 'gzip');
                    res.set('Content-Type', 'text/javascript');
                    console.log("GZIP ON: ", req.url)
                    next();
                })
                .get('*.css', function (req, res, next) {
                    if(req.url.endsWith("/")) req.url = req.url.slice(0, -1);
                    req.url = req.url + '.gz';
                    res.set('Content-Encoding', 'gzip');
                    res.set('Content-Type', 'text/css');
                    console.log("GZIP ON: ", req.url)
                    next();
                })
        }
        */

       /*
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
         AppServer.LongPoll.create("/sapien/api/gameplay/listenforteamname/:teamid", async (req, res, next) => {
            req.id = req.params.teamid;
            const team = await monTeamModel.findById(req.id).then(r => r ? Object.assign(new GameModel(), r.toJSON()) : null);
            if (team) {              
                next();               
            } else {
                res.status(500).send("no team")
            }
        }, {maxListeners: 500})
    
        AppServer.app.use('/', AppServer.router)
            //.post('*', Passport.authenticate('jwt', { session: false }))
            //Passport.authenticate('jwt', { session: false }),
            .use('/sapien/api/rounds', RoundController)
            .use('/sapien/api/' + GameModel.REST_URL, GameCtrl)
            .use('/sapien/api/auth', LoginCtrl)
            .use('/sapien/api/team', TeamCtrl)
            .use('/sapien/api/user', UserCtrl)
            .use('/sapien/api/gameplay', /*Passport.authenticate('jwt', { session: false }),*/ GamePlayCtrl)
            .use('/sapien/api/facilitator', /*Passport.authenticate('jwt', { session: false }),*/ FacilitationCtrl)

            .post('/sapien/api/facilitation/round/:gameid', Passport.authenticate('jwt', { session: false }), async (req, res) => {
                //console.log("HIT HERe", req.body);
                //var c = new winston.transports.Console();
            
      
                try {

                    
                    // define the custom settings for each transport (file, console)
                   
        
                     
                    const game: GameModel = await monGameModel.findById(req.params.gameid).populate("Teams").then(g => Object.assign(new GameModel(), g.toJSON()));
                    const mapping: RoundChangeMapping = await GamePlayUtilities.HandleRoundChange(Object.assign(new RoundChangeMapping(), req.body), game)
                    const round = await monRoundModel
                                        .findOne({ Name: mapping.ParentRound.toUpperCase() })
                                        .then(r => r.toJSON());

                    console.log(" %s", req.params.gameid)  ;   
              
                    console.log("Roundchange mapping:", mapping.ShowFeedback, mapping.SlideFeedback, req.body.ShowFeedback, req.body.SlideFeedback)  ;     

                    //Pick role for each player on each team
                    //TODO: get rid of magic string
                    
                    // Update Game object on DB

                    // Score calculating
                    if (mapping.ShowFeedback || mapping.SlideFeedback) {
                        console.log("SHOULD BE CALCING SCORE")
                        //var Name = mapping.ChildRound.toUpperCase();
                        var subRounds: SubRoundModel[] = await monSubRoundModel.find({ RoundId: mapping.RoundId })
                            .populate("Questions")
                            .then(srs => srs.map(sr => Object.assign(new SubRoundModel(), sr.toJSON()))); //.then()

                        
                        //we need the PREVIOUS subround
                        let responsesFound = false;
                        for (let j = 0; j < subRounds.length; j++) {
                            let subRound = subRounds[j];
                            //Some subrounds may be unscored
                            if (subRound.SkipScoring) continue;

                            for (let i = 0; i < game.Teams.length; i++) {
                                let t = game.Teams[i];
                                //get the team's responses in this subround
                                const responses: ResponseModel[] = await monResponseModel.find(
                                    { targetObjId: t._id, SubRoundId: subRound._id }).then(rs => rs ? rs.map(r => Object.assign(new ResponseModel(), r.toJSON())) : null)
                                let questions = subRound.Questions;

                                //get TEAM_RATING questions. They will be filtered out by rounds that don't have them, since there is no response
                                let ratingQuestions = await monQModel.find({RatingMarker: RatingType.TEAM_RATING}).then(qs => qs ? qs.map(q => Object.assign(new QuestionModel(), q.toJSON(), {SkipScoring: true})) : null)
                                questions = questions.concat(ratingQuestions);

                                let srs = GamePlayUtilities.HandleScores(questions, responses, game, t, round, subRound);

                                var oldScore: SubRoundScore = await monSubRoundScoreModel.findOne({ TeamId: t._id, SubRoundId: subRound._id }).then(sr => sr ? Object.assign(new SubRoundScore(), sr.toJSON()): null);
                                if (oldScore && oldScore.BonusPoints) srs.NormalizedScore += oldScore.BonusPoints;
                                var savedSubRoundScore: SubRoundScore = await monSubRoundScoreModel.findOneAndUpdate({ TeamId: t._id, SubRoundId: subRound._id }, srs, { upsert: true, new: true, setDefaultsOnInsert: true }).then(sr => Object.assign(new SubRoundScore(), sr.toJSON()));
                            
                            }
                        }
                    }

                    //var mapperydoo = (newMapping && newMapping.ParentRound.length) ? newMapping : oldMapping;
                    //mapperydoo.SlideNumber = mapping.SlideNumber;
                    const gameSave = await monGameModel.findByIdAndUpdate(req.params.gameid, { CurrentRound: mapping, HasBeenManager: game.HasBeenManager });
                    if (gameSave ) {
                        //&& advanceGame
                        AppServer.LongPoll.publishToId("/listenforgameadvance/:gameid", req.params.gameid, mapping);
                        res.json("long poll publish hit");
                    }
                                
                }
                catch (err) {
                    console.log("except");
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
                            path: "SubRounds",
                            populate: {
                                path: "Questions"
                            }
                        }
                    }
                )
                .then(rs => rs ? rs.map(r => Object.assign(new RoundModel(), r.toJSON())) : null);

            //console.log("<<<<<<<<<<<ROUNDS>>>>>>>>>>>>>>>>>>>>>", rounds)

            let letters = ["A", "B", "C", "D", "E"]
            for (let i = 0; i < rounds.length; i++) {
                let r = rounds[i];

                for (let j = 0; j < r.SubRounds.length; j++) {
                    let sr = r.SubRounds[j];
                    sr.RoundId = r._id.toString();
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

                    for(let n = 0; n < sr.Questions.length; n++){
                        
                        let q = sr.Questions[n];
                        let savedQuestion = await monQModel.findByIdAndUpdate(q._id, {SubRoundId: sr._id}, {new : true} )
                    }

                    const savedSr = await monSubRoundModel.findByIdAndUpdate(sr._id, sr);
                    if (!savedSr) throw new Error(JSON.stringify({ message: "Couldn't save subround: ", sr }));

                }

            }

        }
        catch (err) {
            console.log(JSON.parse(err))
        }
    }

    public static async setMessageRoundLabels(){
        const srs = await monSubRoundModel.find().then(srs => srs.map(sr => Object.assign(new SubRoundModel(), sr.toJSON())));

        for(let i = 0 ; i < srs.length; i++){
            let sr = srs[i];
            let messages = [];
            Object.keys(JobName).forEach((jn)=> {
                messages = messages.concat(sr[AppServer._getMessageProp(JobName[jn])]);
            })

            //console.log("MESSAGES?>?>?>?>?>?>?>?>?>?>?>?>?>?>?>?>", messages, sr)

            //inflate messages for subround
            let populatedMessages: MessageModel[] = await monMessageModel.find({ _id: { $in: messages } }).then(messages => messages ? messages.map(m => Object.assign(new MessageModel(), m.toJSON())) : null)

            //set round ids and save
            for(let j = 0; j < populatedMessages.length; j++){
                let m = populatedMessages[j];
                m.SubRoundLabel = sr.Label;
                m.RoundId = sr._id;
                await monMessageModel.findByIdAndUpdate(m._id, m);
            }
        }
    }

    static _getMessageProp(job: JobName): keyof SubRoundModel {
        switch (job) {
            case JobName.MANAGER:
                return 'LeaderMessages'
            case JobName.CHIPCO:
                return 'ChipCoMessages'
            case JobName.INTEGRATED_SYSTEMS:
                return 'IntegratedSystemsMessages'
            case JobName.BLUE_KITE:
                return 'BlueKiteMessages'
            default:
                return 'ICMessages'
        }
    }

}