import FiStMa from '../../shared/FiStMa';
import BaseController from '../../shared/BaseController';
import GameModel from '../../shared/models/GameModel';
import Round1 from './Round1';
import Round2 from './Round2';
import Round3 from './Round3';

export default class GameCtrl extends BaseController<GameModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private readonly rounds = {
        round1: Round1, 
        round2: Round2, 
        round3: Round3
    };

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: React.Component<any, any>) {
        super(new GameModel(), reactComp.forceUpdate.bind(reactComp));
        var rndsFistma = this.dataStore.RoundsFistma = new FiStMa(this.rounds, this.rounds.round1);
        rndsFistma.addTransition(this.rounds.round1);
        rndsFistma.addTransition(this.rounds.round2);
        rndsFistma.addTransition(this.rounds.round3);
        rndsFistma.addOnEnter(this.rounds.round1, this._onRoundEnter.bind(this));
        rndsFistma.addOnEnter(this.rounds.round2, this._onRoundEnter.bind(this));
        rndsFistma.addOnEnter(this.rounds.round3, this._onRoundEnter.bind(this));

        console.log("YO1:", this.dataStore.Name, "why is this undefined?");

        this.dataStore.Name = "Some initial value";
        console.log("YO2:", this.dataStore.Name);

        setTimeout(() => {
            rndsFistma.goTo(this.rounds.round2);
            this.dataStore.Name = "Bless you!!!";
            console.log("YO3:", this.dataStore.Name);
            this.dataStore.Butt = "My old Butt";
        }, 1);

        setTimeout(() => {
            rndsFistma.goTo(this.rounds.round3);
            //this.dataStore.Misc.push(123);
            //this.dataStore.Misc[3] = 4;
            //this.dataStore.Misc = [4,5,6,7];
            this.dataStore.Misc = this.dataStore.Misc.concat(4);
            console.log("YO4:", this.dataStore.Misc);
            this.dataStore.Butt = "My new Butt";

            this.dataStore.DeepObj.depth1.depth2.depth3.msg = "Dang straight";
            this.dataStore.NoInitValue = "Now I have a value";
        }, 3);
    }
    
    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    private _onRoundEnter(fromState:React.Component<{}, any>): void {
        console.log("Entered round", this.dataStore.RoundsFistma.currentState, "from round", fromState);
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}