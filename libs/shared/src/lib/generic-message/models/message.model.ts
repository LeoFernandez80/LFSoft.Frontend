import { EnumMessageType } from '../enums/message-type.enum';

export class Message {
    constructor(
        public message: string, 
        public type: EnumMessageType, 
        public autoClose: number = 5000
    ) {}
}
