import BaseModel from "../base-sapien/models/BaseModel";
import GameModel from "./GameModel";
import UserModel from "./UserModel";
import ApplicationViewModel from './ApplicationViewModel';

export default class AdminViewModel extends BaseModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    Games: GameModel[] = [];

    SelectedGame: GameModel;

    Users: UserModel[] = [];

    AdminUsers: UserModel[] = [];

    PlayerUsers: UserModel[] = [];

    FacilitatorUsers: UserModel[] = [];

    FilteredGames: GameModel[] = [];

    FilteredUsers: UserModel[] = [];

    PlayerFilter: any = {};
    AdminFilter: any = {};
    FacilitatorFilter: any = {};

    GameFilter: any = {};

    DeletionUser: UserModel;

    DeletionGame: GameModel;

    private _CurrentUser: UserModel;
    get CurrentUser(): UserModel {
        return ApplicationViewModel.CurrentUser;
    }

    set CurrentUser(user: UserModel) {
        this._CurrentUser = user;
    }

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        super();
    }

}