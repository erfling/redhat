import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ApplicationViewModel from '../../shared/models/ApplicationViewModel';
import BaseController from "../../shared/entity-of-the-state/BaseController";
import { Component } from 'react';
import Game from '../game/Game';
import GameList from './GameList';
import Admin from './Admin';
import DefaultAdmin from './DefaultAdmin'
import BaseClientCtrl from '../../shared/base-sapien/client/BaseClientCtrl';
import AdminLogin from '../login/AdminLogin'
import GameLogin from '../login/GameLogin'
import UserList from './UserList';
import ApplicationCtrl from '../ApplicationCtrl'
import { RoleName } from '../../shared/models/UserModel';
import GameDetail from './GameDetail';

export default class AdminCtrl extends BaseClientCtrl<any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    protected readonly ComponentStates = {
        game: GameList,
        gameDetail: GameDetail,
        users: UserList,
        adminLogin: AdminLogin,
        default: DefaultAdmin,
        gameLogin: GameLogin
    };



    component: any;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: Component<any, any>) {

        super(null, reactComp);

        this.component = reactComp;
        

        //if we don't have a user, go to admin login.
        if(!ApplicationViewModel.CurrentUser || !ApplicationViewModel.Token){
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.adminLogin);
        } 
        //if we have a user, but not an admin, go to game login
        else if (!ApplicationViewModel.CurrentUser || ApplicationViewModel.CurrentUser.Role != RoleName.ADMIN) {
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.ComponentStates.adminLogin);
        }
        //otherwise, go where the url tells us. If bad url, go to admin default
        else{
            console.log("HEY YOU",this.component.props.location);
            this.ComponentFistma = new FiStMa(this.ComponentStates, this.UrlToComponent(this.component.props.location.pathname) || this.ComponentStates.default);
        }

        this.ComponentFistma.addTransition(this.ComponentStates.adminLogin)
        this.ComponentFistma.addTransition(this.ComponentStates.default)
        this.ComponentFistma.addTransition(this.ComponentStates.game)
        this.ComponentFistma.addTransition(this.ComponentStates.gameLogin)
        this.ComponentFistma.addTransition(this.ComponentStates.users)

        this.dataStore = Object.assign(new AdminViewModel(), {
            ComponentFistma: this.ComponentFistma
        })

        this.component.componentDidUpdate = (prevProps, prevState, snapshot) => {
            this.conditionallyNavigate(this.component.props.location.pathname, prevProps.location.pathname)
        }
    }
    
    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    private _onRoundEnter(fromState:React.Component<{}, any>): void {
        console.log("Entered round", this.dataStore.RoundsFistma.currentState, "from round", fromState);
    }

    
    
    /**
     * Go to next game round
     * 
     */
    public advanceRound(){
        this.dataStore.RoundsFistma.next();
    }
    
    /**
     * Go to previous game round
     * 
     */
    public goBackRound(){ 
        this.dataStore.RoundsFistma.previous();
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------
 

}