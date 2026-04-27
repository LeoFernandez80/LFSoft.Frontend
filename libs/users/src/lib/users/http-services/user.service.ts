import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PageFilter, PaginatedList } from '@lib/shared';
import { UserFilter } from '../models/user-filter.model';
import { UserGrid } from '../models/user-grid.model';
import { User } from '../models/user.model';
import { AccessControl, ConfigurationService, Terminal } from '@lib/common';
import { EnumUserRole } from '@lib/security';
import { environment } from 'src/environments/environment';


 class HTTPResponseUser  {  
  user: User = new User();
  accessControl:AccessControl | null = null;
  validations: string[] = [];
  errores: string[] = [];
}

class HTTPRequestUser  {  
  user: User = new User();
  terminal: Terminal | null = null;
}

@Injectable({
  providedIn: 'root'
})
export class HTTPServiceUser {
  private _configurationService = inject(ConfigurationService);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;


  // GET ALL (paginado y filtrado)
  getUsers(pageFilter: PageFilter, filterParameters: UserFilter): Observable<PaginatedList<UserGrid>> {
    const pageParams = pageFilter.toString();    
    const userParams = filterParameters.toString();
    const paramsString = userParams ? `${pageParams}&${userParams}` : pageParams;   
    
    return this.http.get<PaginatedList<UserGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    });
  }
  // GET BY ID
  getUser(id: number): Observable<HTTPResponseUser> {
    return this.http.get<HTTPResponseUser>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching user:', error);
        return throwError(() => error);
      })
    );
  }

  // GET BY ID
  open(id: number): Observable<HTTPResponseUser> {
    return this.http.get<HTTPResponseUser>(`${this.apiUrl}/${id}/open`, {
      headers: this.getHeaders(),
      params: {
        terminalId: this._configurationService.terminal.terminalId,
        terminalName: this._configurationService.terminal.terminalName
      }
    }).pipe(
      catchError(error => {
        console.error('Error fetching user:', error);
        return throwError(() => error);
      })
    );
  }

  // GET BY USERNAME
  getUserByUserName(userName: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/by-username/${userName}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching user by username:', error);
        return throwError(() => error);
      })
    );
  }

  // CREATE
  createUser(user: User): Observable<User> {  
    const userRq: HTTPRequestUser = {
      user: {
        user_id: user.user_id,
        user_username: user.user_username,
        user_email: user.user_email,
        user_password: user.user_password,
        user_firstName: user.user_firstName,
        user_lastName: user.user_lastName,
        user_role: EnumUserRole.USER,
        personId: user.personId,
        user_active: user.user_active
      } as User,
      terminal: this._configurationService.terminal
    };
    return this.http.post<User>(this.apiUrl, userRq, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating user:', error);
        return throwError(() => error);
      })
    );
  }

  // UPDATE
  updateUser(user: User): Observable<User> {
    const userRq: HTTPRequestUser = {
      user: {
        user_id: user.user_id,
        user_username: user.user_username,
        user_email: user.user_email,
        user_firstName: user.user_firstName,
        user_lastName: user.user_lastName,
        user_role: user.user_role,
        personId: user.personId,
        user_active: user.user_active
      } as User,
      terminal: this._configurationService.terminal
    };
    console.log('FE updateUser - Enviando:', userRq);
    
    return this.http.put<User>(`${this.apiUrl}/${user.user_id}`, userRq, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => error);
      })
    );
  }
  
  // DELETE
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting user:', error);
        return throwError(() => error);
      })
    );
  }

  closeUser(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/close`, this._configurationService.terminal, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error closing user:', error);
        return throwError(() => error);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
