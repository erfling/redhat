'use strict';

export default class FiStMa<T> {
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    /** The states object (usually an Enum). */
    public readonly states: T;

    private _previousState: T[keyof T] | undefined;
    public get previousState(): T[keyof T] | undefined {
        return this._previousState;
    }

    private _currentState: T[keyof T];
    /** The state we are currently on. If settting, runs goTo method. */
    public get currentState(): T[keyof T] {
        return this._currentState;
    }
    public set currentState(value: T[keyof T]) {
        this.goTo(value);
    }

    /** Whether to allow a state to transition to itself. */
    public allowSelfTransition: boolean = false;

    /** Object map of allowed transitions from 'key' state to 'toStates[]' */
    private _allowedTransitions: { [key: string]: T[keyof T][] } = Object.create(null);

    /** Object map of callbacks to run when entering the 'key' state. */
    private _onEnterCallbacks: { [key: string]: { (from: T[keyof T]): void; }[] } = Object.create(null);

    /** Object map of callbacks to run when exiting the 'key' state. */
    private _onExitCallbacks: { [key: string]: { (from: T[keyof T]): void; }[] } = Object.create(null);

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    /**
     * Create new instance, passing possible states (usually an enum), currentState, and whether to allow transitions from and to the same state.
     * @param currentState State we will initialize in.
     */
    constructor(states: T, currentState: T[keyof T], allowSelfTransition?: boolean) {
        // TODO: Refactor to map states to key string collection
        this.states = states;
        this._currentState = currentState;
        this.allowSelfTransition = allowSelfTransition || false;
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------

    /**
     * Add callback to run when entering the given state.
     * @param state
     * @param callback
     */
    public addOnEnter(state: T[keyof T], callback: (fromState?: T[keyof T]) => any): FiStMa<T> {
        var key = state.toString();
        if (!this._onEnterCallbacks[key]) this._onEnterCallbacks[key] = [];
        this._onEnterCallbacks[key].push(callback);

        return this;
    }

    /**
     * Remove specified onEnter callback for the given state.
     * @param state 
     * @param callback 
     */
    public removeOnEnter(state: T[keyof T], callback: (fromState?: T[keyof T]) => any): FiStMa<T> {
        var key = state.toString();
        if (!this._onEnterCallbacks[key]) this._onEnterCallbacks[key] = [];
        var index = this._onEnterCallbacks[key].indexOf(callback);
        if (index > -1) {
            this._onEnterCallbacks[key].splice(index, 1);
        } else {
            console.warn("state", state, "has no such callback.");
        }

        return this;
    }

    /**
     * Add callback to run when exiting the given state.
     * @param state
     * @param callback
     */
    public addOnExit(state: T[keyof T], callback: (toState?: T[keyof T]) => any): FiStMa<T> {
        var key = state.toString();
        if (!this._onExitCallbacks[key]) this._onExitCallbacks[key] = [];
        this._onExitCallbacks[key].push(callback);

        return this;
    }

    /**
     * Remove specified onExit callback for the given state.
     * @param state 
     * @param callback 
     */
    public removeOnExit(state: T[keyof T], callback: (fromState?: T[keyof T]) => any): FiStMa<T> {
        var key = state.toString();
        if (!this._onExitCallbacks[key]) this._onExitCallbacks[key] = [];
        var index = this._onExitCallbacks[key].indexOf(callback);
        if (index > -1) {
            this._onExitCallbacks[key].splice(index, 1);
        } else {
            console.warn("state", state, "has no such callback.");
        }

        return this;
    }


    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    /**
     * Returns whether we are currently in the given state.
     * @param state
     */
    public inState(state: T[keyof T]): boolean {
        return this._currentState === state;
    }

    /**
     * Returns if the current state is allowed to transition to the given state.
     * @param toState
     */
    public canGoTo(toState: T[keyof T]): boolean {
        return this._isValidTransition(this._currentState, toState);
    }

    /**
     * Attempt to transition to the given state and return if the transition was successful.
     * Runs any associated onExit and onEnter callbacks if transition is allowed.
     * @param toState
     */
    public goTo(toState: T[keyof T]): boolean {
        var success = this._isValidTransition(this._currentState, toState);
        if (success) {
            var fromState = this._currentState;

            // run all onExit callbacks tied to current state before changing states
            var key = fromState.toString();
            if (!this._onExitCallbacks[key]) this._onExitCallbacks[key] = [];
            this._onExitCallbacks[key].forEach(callBack => {
                if (callBack) callBack.call(this, toState);
            });

            // store last state
            this._previousState = this._currentState;
            // set state
            this._currentState = toState;

            // run all onEnter callbacks tied to state we just entered
            key = toState.toString();
            if (!this._onEnterCallbacks[key]) this._onEnterCallbacks[key] = [];
            this._onEnterCallbacks[key].forEach(callBack => {
                //console.log("key state:", key, "callback:", callBack);
                if (callBack) callBack.call(this, fromState);
            });
        } else {
            console.warn("current state", this._currentState, "is not permitted to go to state", toState);
        }
        
        return success;
    }

    /**
     * Adds allowed transition from 'fromState' to any of the 'toStates'.
     * Automatically removes duplicate toStates.
     * If toStates is ommitted, every state transition is added.
     * @param fromState
     * @param toStates
     */
    public addTransition(fromState: T[keyof T], ...toStates: T[keyof T][]): void {
        var key = fromState.toString();
        if (!this._allowedTransitions[key]) this._allowedTransitions[key] = [];
        if (!toStates.length) toStates = Object.keys(this.states).map(el => this.states[<keyof T>el]);
        this._allowedTransitions[key] = [ ...new Set(this._allowedTransitions[key].concat(toStates)) ];
    }

    /**
     * Removes allowed transition from 'fromState' to any of the 'toStates'.
     * If toStates is ommitted, every state transition is removed.
     * @param fromState
     * @param toStates
     */
    public removeTransition(fromState: T[keyof T], ...toStates: T[keyof T][]): void {
        var key = fromState.toString();
        if (!this._allowedTransitions[key]) this._allowedTransitions[key] = [];
        this._allowedTransitions[key] = this._allowedTransitions[key].filter((el) => toStates.indexOf(el) == -1);
    }

    /**
     * Returns if the fromState is allowed to transition to the toState.
     * @param fromState
     * @param toState
     */
    private _isValidTransition(fromState: T[keyof T], toState: T[keyof T]): boolean {
        var key = fromState.toString();
        if (!this._allowedTransitions[key]) this._allowedTransitions[key] = [];
        var indexOf = this._allowedTransitions[key].indexOf(toState);

        return (this.allowSelfTransition && fromState === toState) || indexOf > -1;
    }

}