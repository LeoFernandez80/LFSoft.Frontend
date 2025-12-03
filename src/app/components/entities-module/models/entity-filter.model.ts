import { QueryParams } from "../../../generic/models/interfaces/query-params.interface";

export class EntityFilter implements QueryParams {
  id?: number;
  description?: string;

  toString(): string {
    console.log("toString", this.description);
    const params = new URLSearchParams();
    if (this.id !== undefined && this.id !== null) {
      params.append('id', this.id.toString());
    }
    if (this.description !== undefined && this.description !== null && this.description !== '') {
      params.append('description', this.description);
    }
    if (params.toString() === '') {
      return '';
    }
    return params.toString();
  }
}