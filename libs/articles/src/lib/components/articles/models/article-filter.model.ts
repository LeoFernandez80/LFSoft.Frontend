import { QueryParams } from "@lib/shared";

export class ArticleFilter implements QueryParams {
  id?: number;
  codigoAsy?: string;
  description?: string;

  toString(): string {
    const params = new URLSearchParams();
    if (this.id !== undefined && this.id !== null) {
      params.append('id', this.id.toString());
    }
    if (this.codigoAsy !== undefined && this.codigoAsy !== null && this.codigoAsy !== '') {
      params.append('codigoAsy', this.codigoAsy);
    }
    if (this.description !== undefined && this.description !== null && this.description !== '') {
      params.append('description', this.description);
    }
    return params.toString();
  }
}
