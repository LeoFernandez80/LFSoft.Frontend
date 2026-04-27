import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  constructor() {}

  getPurchasesHello(): string {
    return 'Hello from PurchasesService';
  }
}
