import { JobName } from "./../shared/models/UserModel";
import { monMappingModel } from "./controllers/GameCtrl";
import { monRoundModel, monSubRoundModel } from "./controllers/RoundCtrl";
import RoundChangeMapping from "../shared/models/RoundChangeMapping";
import SubRoundScore from "../shared/models/SubRoundScore";
import GameModel from "../shared/models/GameModel";
import SubRoundModel from "../shared/models/SubRoundModel";

export default class GamePlayUtils {

  public static async HandleRoundChange(
    passedMapping: RoundChangeMapping,
    game: GameModel
  ): Promise<RoundChangeMapping> {
    let mapping: RoundChangeMapping = Object.assign(new RoundChangeMapping(), {
      ...passedMapping
    });

    console.log("Roundchange mapping: as curried", mapping.ShowFeedback, mapping.SlideFeedback, passedMapping.ShowFeedback, passedMapping.SlideFeedback)  ;     

    //Pick role for each player on each team
    //TODO: get rid of magic string
    mapping.UserJobs = {};

    mapping.ParentRound = mapping.ParentRound.toLowerCase();
    mapping.ChildRound = mapping.ChildRound.toLowerCase();

    const round = await monRoundModel
      .findOne({ Name: mapping.ParentRound.toUpperCase() })
      .then(r => r.toJSON());

    let srModel: SubRoundModel = await monSubRoundModel
      .findOne({ Name: mapping.ChildRound.toUpperCase() })
      .then(x => x.toJSON());
    let SubRoundLabel: String = srModel.Label.toString().toUpperCase();
    let newMapping: RoundChangeMapping;

    console.log("RELEVANT SUBROUND IS: ", SubRoundLabel);
    let RoundId = round._id;
    mapping.RoundId = round._id;

    //make sure the current mapping has the correct child round
    var oldMapping: RoundChangeMapping = await monMappingModel
      .findOneAndUpdate(
        { GameId: game._id, ParentRound: mapping.ParentRound },
        {
          ChildRound: mapping.ChildRound,
          ShowRateUsers: mapping.ShowRateUsers, // object where keys are user's _id as string & values are one of JobName enum values
          ShowFeedback: mapping.ShowFeedback, // object where keys are user's _id as string & values are one of JobName enum values
          ShowIndividualFeedback: mapping.ShowIndividualFeedback,
          SlideFeedback: mapping.SlideFeedback,
          RoundId,
          SlideNumber: mapping.SlideNumber
        },
        { new: true },
        function(err, doc) {
          if (err) {
            console.log("Something wrong when updating data!", err);
          }
        }
      )
      .then(
        r => (r ? Object.assign(new RoundChangeMapping(), r.toJSON()) : null)
      );

    //Determine if an event should be sent to players or if the new mapping only reflects a change in slide presentation
    let advanceGame = true;
    if (
      oldMapping &&
      oldMapping.ChildRound == mapping.ChildRound &&
      oldMapping.ShowFeedback == mapping.ShowFeedback &&
      oldMapping.ShowIndividualFeedback == mapping.ShowIndividualFeedback &&
      oldMapping.ShowRateUsers == mapping.ShowRateUsers
    ) {
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
              mapping.UserJobs[pid] = !isChip
                ? JobName.INTEGRATED_SYSTEMS
                : JobName.CHIPCO;
              isChip = !isChip;
            }
          }
        });
      } else {
        //set another manager
        let roundNumber = Number(round.Label);
        console.log("HAD USER JOBS FOR", roundNumber);
        game.Teams.forEach(t => {
          //   console.log("TEAM ", t)
          for (let i = 0; i < t.Players.length; i++) {
            let pid = t.Players[i].toString();

            if (i == roundNumber - 1) {
              game.HasBeenManager.push(pid);
              mapping.UserJobs[pid] = JobName.MANAGER;
            }
          }

          //make sure each team has a manager, even if all the team members have been manager
          if (
            t.Players.every(p => {
              //console.log("examing", p, mapping.UserJobs[p._id.toString()])
              return mapping.UserJobs[p._id.toString()] != JobName.MANAGER;
            })
          ) {
            //console.log("DIDN'T FIND MANAGER FOR ", t)
            mapping.UserJobs[
              t.Players[
                Math.floor(Math.random() * t.Players.length)
              ]._id.toString()
            ] = JobName.MANAGER;
          }
        });
      }

      mapping.GameId = game._id;
      newMapping = await monMappingModel
        .create(mapping)
        .then(r => Object.assign(new RoundChangeMapping(), r.toJSON()));
    } else if (!oldMapping.UserJobs) {
      let roundNumber = Number(round.Label);
      console.log("HAD NO USER JOBS FOR", roundNumber);

      game.Teams.forEach(t => {
        for (let i = 0; i < t.Players.length; i++) {
          let pid = t.Players[i].toString();

          if (i == roundNumber - 1) {
            game.HasBeenManager.push(pid);
            mapping.UserJobs[pid] = JobName.MANAGER;
          }
        }

        //make sure each team has a manager, even if all the team members have been manager
        if (
          t.Players.every(p => {
            //console.log("examing", p, mapping.UserJobs[p._id.toString()])
            return mapping.UserJobs[p._id.toString()] != JobName.MANAGER;
          })
        ) {
          //console.log("DIDN'T FIND MANAGER FOR ", t)
          mapping.UserJobs[
            t.Players[
              Math.floor(Math.random() * t.Players.length)
            ]._id.toString()
          ] = JobName.MANAGER;
        }
      });
    } else if (SubRoundLabel.toLowerCase() == "4c") {
      console.log("WE ARE LOOKING FOR BLUE_KITES");
      let pindex = 0;
      game.Teams.forEach(t => {
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

      console.log("HAD MAPPING WITH JOBS");
      game.Teams.forEach(t => {
        for (let i = 0; i < t.Players.length; i++) {
          console.log("What up playa", t.Players[i]);
          let pid = t.Players[i].toString();

          if (i == roundNumber - 1) {
            game.HasBeenManager.push(pid);
            oldMapping.UserJobs[pid] = JobName.MANAGER;
          }
        }

        //make sure each team has a manager, even if all the team members have been manager
        if (
          t.Players.every(p => {
            //console.log("examing", p, mapping.UserJobs[p._id.toString()])
            return oldMapping.UserJobs[p._id.toString()] != JobName.MANAGER;
          })
        ) {
          //console.log("DIDN'T FIND MANAGER FOR ", t)
          oldMapping.UserJobs[
            t.Players[
              Math.floor(Math.random() * t.Players.length)
            ]._id.toString()
          ] = JobName.MANAGER;
        }
      });
      newMapping = oldMapping;
    }

    // console.log( "blue_kite mapping.UserJobs %o", mapping.UserJobs);

    mapping.GameId = game._id;

    if ((!newMapping || !newMapping.ParentRound.length) && !oldMapping) {
      throw new Error("Couldn't make mapping");
    }

    console.log(newMapping, passedMapping);

    if(!newMapping) newMapping = passedMapping;

    newMapping.ShowFeedback = passedMapping.ShowFeedback;
    newMapping.SlideFeedback = passedMapping.SlideFeedback;

    return newMapping;

  }

  public HandleScores(): SubRoundScore {
    let score = new SubRoundScore();
    return score;
  }
}
