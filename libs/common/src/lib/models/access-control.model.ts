import { Terminal } from "./terminal.model";

export class AccessControl {
  userId: string = '';
  objectKey: string = '';
  createdAt: Date = new Date();
  terminal: Terminal = new Terminal();
  
  message(message: string): string {
    return message.replace('{userId}', this.userId).replace('{objectKey}', this.objectKey);
  }
}