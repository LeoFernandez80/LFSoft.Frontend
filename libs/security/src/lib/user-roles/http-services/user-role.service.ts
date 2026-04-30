import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PageFilter, PaginatedList } from '@lib/shared';
import { ConfigurationService, Terminal } from '@lib/common';
import { environment } from 'src/environments/environment';
import { UserRoleFilter } from '../models/user-role-filter.model';
import { UserRoleGrid } from '../models/user-role-grid.model';
import { UserRole } from '../models/user-role.model';
import { UserRoleResponse } from '../models/user-role-response.model';

class HTTPRequestUserRole {
  userRole: UserRole = new UserRole();
  terminal: Terminal | null = null;
}

@Injectable({
  providedIn: 'root'
})
export class HTTPServiceUserRole {
  private _configurationService = inject(ConfigurationService);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user-roles`;

  getUserRoles(pageFilter: PageFilter, filterParameters: UserRoleFilter): Observable<PaginatedList<UserRoleGrid>> {
    const pageParams = pageFilter.toString();
    const filterParams = filterParameters.toString();
    const paramsString = filterParams ? `${pageParams}&${filterParams}` : pageParams;

    return this.http.get<PaginatedList<UserRoleGrid>>(`${this.apiUrl}?${paramsString}`, {
      headers: this.getHeaders()
    });
  }

  getUserRole(id: string): Observable<UserRoleResponse> {
    return this.http.get<UserRoleResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching user role:', error);
        return throwError(() => error);
      })
    );
  }

  open(id: string): Observable<UserRoleResponse> {
    return this.http.get<UserRoleResponse>(`${this.apiUrl}/${id}/open`, {
      headers: this.getHeaders(),
      params: {
        terminalId: this._configurationService.terminal.terminalId,
        terminalName: this._configurationService.terminal.terminalName
      }
    }).pipe(
      catchError(error => {
        console.error('Error opening user role:', error);
        return throwError(() => error);
      })
    );
  }

  createUserRole(userRole: UserRole): Observable<UserRole> {
    const userRoleRq: HTTPRequestUserRole = {
      userRole: {
        userRolId: userRole.userRolId,
        userRolName: userRole.userRolName,
        userRolType: userRole.userRolType,
        userRolDescription: userRole.userRolDescription
      } as UserRole,
      terminal: this._configurationService.terminal
    };

    return this.http.post<UserRole>(this.apiUrl, userRoleRq, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating user role:', error);
        return throwError(() => error);
      })
    );
  }

  updateUserRole(userRole: UserRole): Observable<UserRole> {
    const userRoleRq: HTTPRequestUserRole = {
      userRole: {
        userRolId: userRole.userRolId,
        userRolName: userRole.userRolName,
        userRolType: userRole.userRolType,
        userRolDescription: userRole.userRolDescription
      } as UserRole,
      terminal: this._configurationService.terminal
    };

    return this.http.put<UserRole>(`${this.apiUrl}/${userRole.userRolId}`, userRoleRq, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating user role:', error);
        return throwError(() => error);
      })
    );
  }

  deleteUserRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting user role:', error);
        return throwError(() => error);
      })
    );
  }

  closeUserRole(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/close`, this._configurationService.terminal, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error closing user role:', error);
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
