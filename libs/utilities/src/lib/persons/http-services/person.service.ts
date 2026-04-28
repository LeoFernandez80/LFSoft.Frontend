import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { PaginatedList, PageFilter } from '@lib/shared';
import { environment } from 'src/environments/environment';
import { PersonFilter } from '../models/person-filter.model';
import { PersonGrid } from '../models/person-grid.model';
import { Person } from '../models/person.model';

interface ApiPerson { id: number; name: string; lastName: string; fullName: string; }
interface CreatePersonRequest { name: string; lastName: string; }
interface UpdatePersonRequest { name: string; lastName: string; }

@Injectable({ providedIn: 'root' })
export class HTTPServicePerson {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/persons`;

  getPersons(pageFilter: PageFilter, filterParameters: PersonFilter): Observable<PaginatedList<PersonGrid>> {
    const pageParams = pageFilter.toString();
    const personParams = filterParameters.toString();
    const paramsString = personParams ? `${pageParams}&${personParams}` : pageParams;
    return this.http.get<PaginatedList<ApiPerson>>(`${this.apiUrl}?${paramsString}`, { headers: this.getHeaders() }).pipe(
      map(response => ({ ...response, data: response.data.map(p => this._mapApiPersonToGrid(p)) })),
      catchError(error => { console.error('Error fetching persons:', error); return throwError(() => error); })
    );
  }

  getPerson(id: number): Observable<Person> {
    return this.http.get<ApiPerson>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(p => this._mapApiPerson(p)),
      catchError(error => { console.error('Error fetching person:', error); return throwError(() => error); })
    );
  }

  createPerson(person: Person): Observable<Person> {
    const request: CreatePersonRequest = { name: person.person_name, lastName: person.person_lastName };
    return this.http.post<ApiPerson>(this.apiUrl, request, { headers: this.getHeaders() }).pipe(
      map(p => this._mapApiPerson(p)),
      catchError(error => { console.error('Error creating person:', error); return throwError(() => error); })
    );
  }

  updatePerson(person: Person): Observable<Person> {
    const request: UpdatePersonRequest = { name: person.person_name, lastName: person.person_lastName };
    return this.http.patch<ApiPerson>(`${this.apiUrl}/${person.person_id}`, request, { headers: this.getHeaders() }).pipe(
      map(p => this._mapApiPerson(p)),
      catchError(error => { console.error('Error updating person:', error); return throwError(() => error); })
    );
  }

  deletePerson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => { console.error('Error deleting person:', error); return throwError(() => error); })
    );
  }

  private _mapApiPerson(person: ApiPerson): Person {
    const m = new Person();
    m.person_id = person.id;
    m.person_name = person.name;
    m.person_lastName = person.lastName;
    m.person_fullName = person.fullName;
    return m;
  }

  private _mapApiPersonToGrid(person: ApiPerson): PersonGrid {
    const m = new PersonGrid();
    m.person_id = person.id;
    m.person_name = person.name;
    m.person_lastName = person.lastName;
    m.person_fullName = person.fullName;
    return m;
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  }
}
