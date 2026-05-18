import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { PaginatedList, PageFilter } from '@lib/shared';
import { ConfigurationService, Terminal } from '@lib/common';
import { environment } from 'src/environments/environment';
import { CompanyFilter } from '../models/company-filter.model';
import { CompanyGrid } from '../models/company-grid.model';
import { Company } from '../models/company.model';
import { CompanyResponse } from '../models/company-response.model';

class HTTPRequestCompany {
  company: Company = new Company();
  terminal: Terminal | null = null;
}

@Injectable({ providedIn: 'root' })
export class HTTPServiceCompany {
  private readonly _configurationService = inject(ConfigurationService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.utilitiesApiUrl}/companies`;

  getCompanies(pageFilter: PageFilter, filterParameters: CompanyFilter): Observable<PaginatedList<CompanyGrid>> {
    const pageParams = pageFilter.toString();
    const companyParams = filterParameters.toString();
    const paramsString = companyParams ? `${pageParams}&${companyParams}` : pageParams;
    return this.http.get<PaginatedList<CompanyGrid>>(`${this.apiUrl}?${paramsString}`, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error fetching companies:', error); return throwError(() => error); })
    );
  }

  getCompany(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error fetching company:', error); return throwError(() => error); })
    );
  }

  open(id: number): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.apiUrl}/${id}/open`, {
      headers: this.getHeaders(),
      params: {
        terminalId: this._configurationService.terminal.terminalId,
        terminalName: this._configurationService.terminal.terminalName
      }
    }).pipe(
      catchError(error => { console.error('Error opening company:', error); return throwError(() => error); })
    );
  }

  createCompany(company: Company): Observable<Company> {
    const request: HTTPRequestCompany = {
      company: {
        company_id: company.company_id,
        company_razonSocial: company.company_razonSocial,
        company_tipo: company.company_tipo,
        company_estado: company.company_estado,
        company_observacion: company.company_observacion
      } as Company,
      terminal: this._configurationService.terminal
    };
    return this.http.post<Company>(this.apiUrl, request, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error creating company:', error); return throwError(() => error); })
    );
  }

  updateCompany(company: Company): Observable<Company> {
    const request: HTTPRequestCompany = {
      company: {
        company_id: company.company_id,
        company_razonSocial: company.company_razonSocial,
        company_tipo: company.company_tipo,
        company_estado: company.company_estado,
        company_observacion: company.company_observacion
      } as Company,
      terminal: this._configurationService.terminal
    };
    return this.http.put<Company>(`${this.apiUrl}/${company.company_id}`, request, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error updating company:', error); return throwError(() => error); })
    );
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error deleting company:', error); return throwError(() => error); })
    );
  }

  closeCompany(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/close`, this._configurationService.terminal, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error closing company:', error); return throwError(() => error); })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  }
}




