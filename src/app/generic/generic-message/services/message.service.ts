import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Message } from "../models/message.model";
import { EnumMessageType } from "../enums/message-type.model";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  public messages$= new BehaviorSubject<Message[]>([]);
  private readonly MAX_MESSAGES = 10; // Límite máximo de mensajes acumulados

  constructor() { }

  addMessage(error: string, type: EnumMessageType, autoClose?: number): void;
  addMessage(error: HttpErrorResponse, type: EnumMessageType, autoClose?: number): void;
  addMessage(error: string | HttpErrorResponse, type: EnumMessageType, autoClose?: number): void {
    const currentMessages = this.messages$.getValue();
    const messageText = typeof error === 'string' ? error : error.message;
    const newMessage = new Message(messageText, type);
    
    // Agregar mensaje y mantener límite máximo
    currentMessages.push(newMessage);
    if (currentMessages.length > this.MAX_MESSAGES) {
      currentMessages.shift(); // Eliminar el mensaje más antiguo
    }
    this.messages$.next(currentMessages);

    // Auto-cerrar mensaje después del tiempo especificado
    if (autoClose) {
      setTimeout(() => {
        this.removeMessage(currentMessages.length - 1);
      }, autoClose);
    }
  }
  
  clearMessages(): void {
    this.messages$.next([]);
  }

  getMessages(): Observable<Message[]> {
    return this.messages$.asObservable();
  }

  removeMessage(index: number): void {
    const currentMessages = this.messages$.getValue();
    if (index >= 0 && index < currentMessages.length) {
      currentMessages.splice(index, 1);
      this.messages$.next(currentMessages);
    }
  }
}