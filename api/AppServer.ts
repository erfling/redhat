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
                   
        
                      
                    const mapping: RoundChangeMapping = Object.assign(new RoundChangeMapping(), req.body);
                    const game: GameModel = await monGameModel.findById(req.params.gameid).populate("Teams").then(g => Object.assign(new GameModel(), g.toJSON()));


                    console.log(" %s", req.params.gameid)  ;   
              
                    console.log("Roundchange mapping:", mapping)  ;     

                    //Pick role for each player on each team
                    //TODO: get rid of magic string
                    mapping.UserJobs = {};

                    mapping.ParentRound = mapping.ParentRound.toLowerCase();
                    mapping.ChildRound = mapping.ChildRound.toLowerCase();

                    const round = await monRoundModel.findOne({ Name: mapping.ParentRound.toUpperCase() }).then(r => r.toJSON())
                    
          
                    let srModel:SubRoundModel = await monSubRoundModel.findOne({Name:mapping.ChildRound.toUpperCase()}).then(x => x.toJSON() );
                    let SubRoundLabel: String = srModel.Label.toString().toUpperCase();
                    let newMapping: RoundChangeMapping;
                      
                    console.log("RELEVANT SUBROUND IS: ", SubRoundLabel)
                    let RoundId = round._id;
                    mapping.RoundId = round._id;

                                        //make sure the current mapping has the correct child round
                    var oldMapping: RoundChangeMapping = await
                     monMappingModel.findOneAndUpdate({ GameId: game._id, ParentRound: mapping.ParentRound }, {
                        ChildRound: mapping.ChildRound,
                        ShowRateUsers: mapping.ShowRateUsers, // object where keys are user's _id as string & values are one of JobName enum values
                        ShowFeedback: mapping.ShowFeedback, // object where keys are user's _id as string & values are one of JobName enum values
                        ShowIndividualFeedback: mapping.ShowIndividualFeedback,
                        SlideFeedback: mapping.SlideFeedback,
                        RoundId,
                        SlideNumber: mapping.SlideNumber
                    }, { new: true }, function (err, doc) {
                        if (err) {

                            console.log("Something wrong when updating data!", err);
                        }
                    }).then(r => r ? Object.assign(new RoundChangeMapping(), r.toJSON()) : null);
                  
                    //Determine if an event should be sent to players or if the new mapping only reflects a change in slide presentation
                    let advanceGame = true;
                    if(oldMapping 
                        && oldMapping.ChildRound == mapping.ChildRound
                        && oldMapping.ShowFeedback == mapping.ShowFeedback
                        && oldMapping.ShowIndividualFeedback == mapping.ShowIndividualFeedback
                        && oldMapping.ShowRateUsers == mapping.ShowRateUsers
                    ){
                        //in cases where only a slide is advanced, and we shouldn't see a gameplay change, all the above props will be unchange.
                        //the only change we expect is to mapping/oldMapping.SlideNumber
                        advanceGame = false;
                    }
               
                    if (!oldMapping) {                     

                        if (mapping.ParentRound.toLowerCase() == "engineeringround") {
                            game.Teams.forEach(t => {
                                var managerAssigned = false;
                                let isChip = false;
                                for (let i = 0; i < t.Players.length; i++) {
                                    let pid = t.Players[i].toString();
                                   // console.log(typeof pid, pid)
                                    
                                    if (i == 2) {
                                        game.HasBeenManager.push(pid);
                                        mapping.UserJobs[pid] = JobName.MANAGER;
                                        managerAssigned = true;
                                    } else {
                                        mapping.UserJobs[pid] = !isChip ? JobName.INTEGRATED_SYSTEMS : JobName.CHIPCO;
                                        isChip = !isChip;
                                    }

                                }
                            })
                        } else {
                           //set another manager
                            let roundNumber = Number(round.Label);
                            console.log("HAD USER JOBS FOR", roundNumber)
                            game.Teams.forEach(t => {
                                
                             //   console.log("TEAM ", t)
                                for (let i = 0; i < t.Players.length; i++) {
                                    let pid = t.Players[i].toString();

                                    if(i == roundNumber -1){
                                        game.HasBeenManager.push(pid);
                                        mapping.UserJobs[pid] = JobName.MANAGER;
                                    }
                                   
                                }

                                //make sure each team has a manager, even if all the team members have been manager 
                                if (t.Players.every(p => {
                                    //console.log("examing", p, mapping.UserJobs[p._id.toString()])
                                    return mapping.UserJobs[p._id.toString()] != JobName.MANAGER
                                })) {
                                    //console.log("DIDN'T FIND MANAGER FOR ", t)
                                    mapping.UserJobs[t.Players[Math.floor(Math.random() * t.Players.length)]._id.toString()] = JobName.MANAGER;
                                }

                            })
                       
        
                                //console.log("Mapping",mapping.UserJobs);
                       
                        }

                        
                     
                       
                        mapping.GameId = game._id;
                        newMapping = await monMappingModel.create(mapping).then(r => Object.assign(new RoundChangeMapping(), r.toJSON()))


                    } else if (!oldMapping.UserJobs) {
                        let roundNumber = Number(round.Label);
                        console.log("HAD NO USER JOBS FOR", roundNumber)

                        game.Teams.forEach(t => {
                            for (let i = 0; i < t.Players.length; i++) {
                                let pid = t.Players[i].toString();

                                if(i == roundNumber -1){
                                    game.HasBeenManager.push(pid);
                                    mapping.UserJobs[pid] = JobName.MANAGER;
                                }
                               
                            }

                            //make sure each team has a manager, even if all the team members have been manager 
                            if (t.Players.every(p => {
                                //console.log("examing", p, mapping.UserJobs[p._id.toString()])
                                return mapping.UserJobs[p._id.toString()] != JobName.MANAGER
                            })) {
                                //console.log("DIDN'T FIND MANAGER FOR ", t)
                                mapping.UserJobs[t.Players[Math.floor(Math.random() * t.Players.length)]._id.toString()] = JobName.MANAGER;
                            }

                        })

                    } else if (SubRoundLabel.toLowerCase() == "4c") {
                        console.log("WE ARE LOOKING FOR BLUE_KITES")
                        let pindex = 0;
                        game.Teams.forEach(
                            t => {


                                //console.log("\t Blue_kite teams %d:", pindex++);
                                //console.log("\t Blue_kite oldMapping %o:", oldMapping);
                                //let playersEligible: Array<UserModel> = t.Players.filter(p => oldMapping.UserJobs[p._id.toString()] != JobName.MANAGER);

                                //console.log("\t Blue_kite players %o:", playersEligible);
                               // let rIndex = Math.floor(Math.random() * playersEligible.length);

                                oldMapping.UserJobs[t.Players[1].toString()] = JobName.BLUE_KITE;
                                //console.log("Blue_kite winner is: %s, id: %s,  name: %s", rIndex, playersEligible[rIndex]._id, (playersEligible[rIndex].FirstName + " " + playersEligible[rIndex].LastName));
                            });

                        newMapping = oldMapping;
                    } else {
                        let roundNumber = Number(round.Label);

                        console.log("HAD MAPPING WITH JOBS")
                        game.Teams.forEach(t => {
                            for (let i = 0; i < t.Players.length; i++) {
                                let pid = t.Players[i].toString();

                                if(i == roundNumber -1){
                                    game.HasBeenManager.push(pid);
                                    oldMapping.UserJobs[pid] = JobName.MANAGER;
                                }
                               
                            }

                            //make sure each team has a manager, even if all the team members have been manager 
                            if (t.Players.every(p => {
                                //console.log("examing", p, mapping.UserJobs[p._id.toString()])
                                return oldMapping.UserJobs[p._id.toString()] != JobName.MANAGER
                            })) {
                                //console.log("DIDN'T FIND MANAGER FOR ", t)
                                oldMapping.UserJobs[t.Players[Math.floor(Math.random() * t.Players.length)]._id.toString()] = JobName.MANAGER;
                            }

                        })
                        newMapping = oldMapping;

                    }               
                            
              
                     
                   // console.log( "blue_kite mapping.UserJobs %o", mapping.UserJobs);   
                     
                    mapping.GameId = game._id;                    
                    

                    if ((!newMapping || !newMapping.ParentRound.length) && !oldMapping) {
                        throw new Error("Couldn't make mapping")
                    }
                    // Update Game object on DB

                    // Score calculating
                    if (mapping.ShowFeedback || mapping.SlideFeedback) {
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

                                let MaxRawScore = 0;
                                let RawScore = 0;

                                let skipMaxScoreQuestionIds: string[] = [];

                                
                                //get TEAM_RATING questions. They will be filtered out by rounds that don't have them, since there is no response
                                let ratingQuestions = await monQModel.find({RatingMarker: RatingType.TEAM_RATING}).then(qs => qs ? qs.map(q => Object.assign(new QuestionModel(), q.toJSON(), {SkipScoring: true})) : null)
                                questions = questions.concat(ratingQuestions);
                               


                                questions.forEach(q => {
                                    
                                    let relevantResponses = responses.filter(r => /*!r.SkipScoring && */ r.QuestionId == q._id.toString());
                                    if (relevantResponses && relevantResponses.length) responsesFound = true;

                                    if(q.SkipScoring) {
                                        skipMaxScoreQuestionIds.push(q._id);
                                    }

                                    relevantResponses.forEach(r => {
                                        RawScore += r.Score;
                                        
                                        if (r.SkipScoring || q.SkipScoring) {
                                            skipMaxScoreQuestionIds.push(q._id);
                                            MaxRawScore += r.MaxScore;
                                            console.log("MAX SCORE FOUND ON RESPONSE FOR QUESTION ", q.Text, r.MaxScore, r.Score, RawScore, MaxRawScore)
                                        }
                                        
                                    });

                                    if ( skipMaxScoreQuestionIds.indexOf(q._id) == -1 ) {
                                        ((q.PossibleAnswers as SliderValueObj[]).forEach(a => {
                                            if (a.maxPoints) MaxRawScore += a.maxPoints;
                                        }))
                                    }

                                    
                                })

                                if (!responsesFound) continue;

                                let srs = Object.assign(new SubRoundScore(), {
                                    TeamId: t._id,
                                    RawScore,
                                    MaxRawScore,
                                    GameId: game._id,
                                    RoundId: subRound.RoundId,
                                    SubRoundId: subRound._id,
                                    SubRoundNumber: subRound.Label,
                                    SubRoundLabel: subRound.ScoreLabel ? subRound.ScoreLabel : subRound.Label,
                                    RoundLabel: round.Label,
                                    TeamLabel: "Team " + t.Number.toString()
                                });


                                if (RawScore > 0 ){

                                    //console.log(srs.SubRoundLabel.toLowerCase());
                                 //  console.log(srs.NormalizedScore); 
                                    if ( srs.SubRoundLabel.toLowerCase()== '1a') {                                        
                                        //srs.NormalizedScore = RawScore / MaxRawScore * (.2 * 20);
                                    } else if (srs.SubRoundLabel.toLowerCase() == '1b') {
                                        //srs.NormalizedScore = RawScore / MaxRawScore * (.8 * 20);                                
                                    }
                                    //add bonus points to team that had highest bid
                                    else if(oldMapping.CurrentHighestBid){
                                        console.log("MAPPING WAS A BID: ", mapping.CurrentHighestBid )
                                        srs.NormalizedScore = (RawScore / MaxRawScore * 16 / subRounds.length);
                                        if(oldMapping.CurrentHighestBid.targetObjId == t._id){
                                            console.log("highest bid bonus should be awared to ", t.Number)
                                            srs.BonusPoints = 4 / subRounds.length;
                                        }    
                                        newMapping = oldMapping;                                   

                                    } else {

                                       srs.NormalizedScore = RawScore / MaxRawScore;
                        
                                    }
                                    //console.log(srs.NormalizedScore); 
                                    srs.NormalizedScore = RawScore / MaxRawScore;
                                }
                                
                                else {
                                   
                                    srs.NormalizedScore = 0;
                                }
                                                                


                                var oldScore: SubRoundScore = await monSubRoundScoreModel.findOne({ TeamId: t._id, SubRoundId: subRound._id }).then(sr => sr ? Object.assign(new SubRoundScore(), sr.toJSON()): null);
                                if (oldScore && oldScore.BonusPoints) srs.NormalizedScore += oldScore.BonusPoints;
                                var savedSubRoundScore: SubRoundScore = await monSubRoundScoreModel.findOneAndUpdate({ TeamId: t._id, SubRoundId: subRound._id }, srs, { upsert: true, new: true, setDefaultsOnInsert: true }).then(sr => Object.assign(new SubRoundScore(), sr.toJSON()));
                            
                            }
                        }
                    }

                    var mapperydoo = (newMapping && newMapping.ParentRound.length) ? newMapping : oldMapping;
                    mapperydoo.SlideNumber = mapping.SlideNumber;
                    const gameSave = await monGameModel.findByIdAndUpdate(req.params.gameid, { CurrentRound: mapperydoo, HasBeenManager: game.HasBeenManager });
                    if (gameSave ) {
                        //&& advanceGame
                        AppServer.LongPoll.publishToId("/listenforgameadvance/:gameid", req.params.gameid, mapperydoo);
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
                        console.log("SAVED QUESTION",savedQuestion)
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