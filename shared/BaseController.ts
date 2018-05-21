'use strict';

export default class BaseController<TModel extends object>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    private _className: string;
    public get className(): string {
        return this._className || (<any>this).constructor.name;
    }

    public readonly dataStore: TModel;

    private _dataStoreChange: Function;
    public set dataStoreChange(val: Function) {
        this._dataStoreChange = val;
    }

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(dataStore: TModel, dataStoreChange: Function) {
        //this.dataStore = this._deepProxy(dataStore);
        this.dataStore = this._deepProxy(dataStore, {
            set: function(target, prop, value, receiver) {
                var success = Reflect.set(target, prop, value, receiver);
                dataStoreChange();
                console.log(`Property ${prop} value changed:`, value, dataStoreChange);
                return success;
            }
        });
        console.log("I am", this.className, dataStoreChange);
        if (dataStoreChange) this.dataStoreChange = dataStoreChange;
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------



    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    public toString(): string {
        return this.className;
    }

    /**
     * Creates a deep nested Proxy object
     * @param dataStore 
     * @param handler 
     */
    private _deepProxy(dataStore: TModel, handler: ProxyHandler<TModel>): TModel {
        function makeHandler(path: PropertyKey[]) {
            return {
                set(target: any, key: PropertyKey, value: any, receiver: any) {
                    if (typeof value === 'object') {
                        value = proxify(value, [...path, key]);
                    }
                    target[key] = value;
    
                    if (handler.set) {
                        handler.set(target, [...path, key].toString(), value, receiver);
                    }
                    return true;
                }
            }
        }

        function proxify(obj: any, path: PropertyKey[]) {
            console.log(path, obj);
            for (let key of Object.keys(obj)) {
                if (typeof obj[key] === 'object') {
                    obj[key] = proxify(obj[key], [...path, key]);
                }
            }
            return new Proxy(obj, makeHandler(path));
        }
    
        return proxify(dataStore, []);
    }

}