import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { PaginatedList, PageFilter } from '@lib/shared';
import { ConfigurationService, Terminal } from '@lib/common';
import { environment } from 'src/environments/environment';
import { PersonFilter } from '../models/person-filter.model';
import { PersonGrid } from '../models/person-grid.model';
import { Person } from '../models/person.model';
import { PersonResponse } from '../models/person-response.model';

class HTTPRequestPerson {
  person: Person = new Person();
  terminal: Terminal | null = null;
}

@Injectable({ providedIn: 'root' })
export class HTTPServicePerson {
  private readonly _configurationService = inject(ConfigurationService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/persons`;

  getPersons(pageFilter: PageFilter, filterParameters: PersonFilter): Observable<PaginatedList<PersonGrid>> {
    const pageParams = pageFilter.toString();
    const personParams = filterParameters.toString();
    const paramsString = personParams ? `${pageParams}&${personParams}` : pageParams;
    return this.http.get<PaginatedList<PersonGrid>>(`${this.apiUrl}?${paramsString}`, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error fetching persons:', error); return throwError(() => error); })
    );
  }

  getPerson(id: number): Observable<PersonResponse> {
    return this.http.get<PersonResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error fetching person:', error); return throwError(() => error); })
    );
  }

  open(id: number): Observable<PersonResponse> {
    return this.http.get<PersonResponse>(`${this.apiUrl}/${id}/open`, {
      headers: this.getHeaders(),
      params: {
        terminalId: this._configurationService.terminal.terminalId,
        terminalName: this._configurationService.terminal.terminalName
      }
    }).pipe(
      catchError(error => { console.error('Error opening person:', error); return throwError(() => error); })
    );
  }

  createPerson(person: Person): Observable<Person> {
    const request: HTTPRequestPerson = {
      person: {
        person_id: person.person_id,
        person_name: person.person_name,
        person_lastname: person.person_lastname,
        person_nickname: person.person_nickname,
        person_fullname: person.person_fullname,
        person_active: person.person_active,
        person_maritalStatus: person.person_maritalStatus
      } as Person,
      terminal: this._configurationService.terminal
    };
    return this.http.post<Person>(this.apiUrl, request, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error creating person:', error); return throwError(() => error); })
    );
  }

  updatePerson(person: Person): Observable<Person> {
    const request: HTTPRequestPerson = {
      person: {
        person_id: person.person_id,
        person_name: person.person_name,
        person_lastname: person.person_lastname,
        person_nickname: person.person_nickname,
        person_fullname: person.person_fullname,
        person_active: person.person_active,
        person_maritalStatus: person.person_maritalStatus
      } as Person,
      terminal: this._configurationService.terminal
    };
    return this.http.put<Person>(`${this.apiUrl}/${person.person_id}`, request, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error updating person:', error); return throwError(() => error); })
    );
  }

  deletePerson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error deleting person:', error); return throwError(() => error); })
    );
  }

  closePerson(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/close`, this._configurationService.terminal, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error closing person:', error); return throwError(() => error); })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  }
}
