import {Schema} from "mongoose";
import BaseModel from "../shared/base-sapien/models/BaseModel";

export default abstract class SchemaBuilder
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    public static fetchSchema(modelClass:any):any {
        modelClass = (typeof modelClass === "function") ? new modelClass() : modelClass;
        var schemaObj:any = {};
        if (modelClass.DbSchema) {
            for (var prop in modelClass) {
                if (modelClass.DbSchema[prop]) schemaObj[prop] = modelClass.DbSchema[prop];
            }
        }
        return schemaObj;
    }

    public static buildSchema(modelClass:any) {
        modelClass = (typeof modelClass === "function") ? new modelClass() : modelClass;
        var schemaObj:any = {};
        for (var prop in modelClass) {
            var type = modelClass.DbSchema && modelClass.DbSchema[prop] ? modelClass.DbSchema[prop] : (<any>modelClass[prop]).constructor;
            if (Array.isArray(type) || type == Array) {
                console.log("IS ARRAY", prop, type, modelClass[prop].length);
                var arr = Array.isArray(type) ? type : modelClass[prop];
                if (arr.length) {
                    var arrType:any = this.getArrayType(arr);
                    var arrTypeInt = typeof arrType === "function" ? new arrType() : arrType;
                    if (arrTypeInt.DbSchema) arrType = arrTypeInt.DbSchema;
                    console.log("ARRAY", prop, Object.keys(arrType), this.getArrayType(arr));
                    schemaObj[prop] = [arrType];
                } else {
                    schemaObj[prop] = [];
                }
            } else {
                console.log("NOT ARRAY", prop, type, modelClass[prop]);
                var typeInt = typeof type === "function" ? new type() : type;
                if (typeInt.DbSchema) type = typeInt.DbSchema;
                schemaObj[prop] = type;
            }
        }
        
        return schemaObj;
    }

    private static getArrayType(arr: any[]): Function {
        if (arr && arr.length) {
            var firstType = typeof arr[0] === "function" ? arr[0] : arr[0].constructor;
            if (arr.every(item => item ===  firstType || item.constructor === firstType)) return firstType;
        }
        return Object;
    }

}