import { EnumMessageType } from "../enums/message-type.model";

export class Message {
    constructor(public message: string, public type: EnumMessageType, public autoClose: number = 5000) {
    }
   
    
}