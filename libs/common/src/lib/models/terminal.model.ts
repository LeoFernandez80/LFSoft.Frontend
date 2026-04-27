import { HttpParams } from "@angular/common/http";

export class Terminal {
  terminalId: string = '';
  terminalName: string = '';

  toString(): string {
    const params = new HttpParams()
      .set('terminalId', this.terminalId)
      .set('terminalName', this.terminalName);
    return params.toString();
  }
}