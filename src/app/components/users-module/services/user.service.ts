import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { PaginatedList } from '../../../generic/models/paginated-list.model';
import { UserFilter } from '../models/user-filter.model';
import { User } from '../models/user.model';
import { UserGrid } from '../models/user-grid.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _mockData: User[] = [
    { id: 1, userName: 'jdoe', role: 'Admin', idPerson: 1 },
    { id: 2, userName: 'jsmith', role: 'User', idPerson: 2 },
    { id: 3, userName: 'ajohnson', role: 'User', idPerson: 3 },
    { id: 4, userName: 'bwilliams', role: 'Moderator', idPerson: 4 },
    { id: 5, userName: 'cbrown', role: 'User', idPerson: 5 },
    { id: 6, userName: 'dmiller', role: 'Admin', idPerson: 6 },
    { id: 7, userName: 'edavis', role: 'User', idPerson: 7 },
    { id: 8, userName: 'fgarcia', role: 'User', idPerson: 8 },
    { id: 9, userName: 'gmartinez', role: 'Moderator', idPerson: 9 },
    { id: 10, userName: 'handerson', role: 'User', idPerson: 10 },
    { id: 11, userName: 'lfernandez', role: 'Admin', idPerson: 11 },
    { id: 12, userName: 'mtorres', role: 'User', idPerson: 12 },
    { id: 13, userName: 'sgomez', role: 'User', idPerson: 13 },
    { id: 14, userName: 'cruiz', role: 'Moderator', idPerson: 14 },
    { id: 15, userName: 'vlopez', role: 'User', idPerson: 15 },
    { id: 16, userName: 'mcastro', role: 'Admin', idPerson: 16 },
    { id: 17, userName: 'psantos', role: 'User', idPerson: 17 },
    { id: 18, userName: 'jmendez', role: 'User', idPerson: 18 },
    { id: 19, userName: 'cvega', role: 'User', idPerson: 19 },
    { id: 20, userName: 'asilva', role: 'Moderator', idPerson: 20 },
    { id: 21, userName: 'mperez', role: 'User', idPerson: 21 },
    { id: 22, userName: 'framos', role: 'Admin', idPerson: 22 },
    { id: 23, userName: 'nmorales', role: 'User', idPerson: 23 },
    { id: 24, userName: 'aflores', role: 'User', idPerson: 24 },
    { id: 25, userName: 'rsosa', role: 'Moderator', idPerson: 25 },
    { id: 26, userName: 'pherrera', role: 'User', idPerson: 26 },
    { id: 27, userName: 'gnavarro', role: 'Admin', idPerson: 27 },
    { id: 28, userName: 'fcabrera', role: 'User', idPerson: 28 },
    { id: 29, userName: 'sibarra', role: 'User', idPerson: 29 },
    { id: 30, userName: 'eortiz', role: 'User', idPerson: 30 }
  ];

  getUsers(pageFilter: PageFilter, filterParameters: UserFilter): Observable<PaginatedList<UserGrid>> {
    let filteredData = this._filterUsers(this._mockData, filterParameters);
    const total = filteredData.length;
    // Map to UserGrid
    let gridData: UserGrid[] = filteredData.map(user => ({
      selected: false,
      id: user.id,
      userName: user.userName,
      role: user.role
    }));
    // Ordenamiento
    if (pageFilter.sortField) {
      gridData.sort((a: any, b: any) => {
        const sortField = pageFilter.sortField??"";
        const valueA = a[sortField];
        const valueB = b[sortField];
        const direction = pageFilter.sortDirection === 'asc' ? 1 : -1;
        if (valueA < valueB) return -1 * direction;
        if (valueA > valueB) return 1 * direction;
        return 0;
      });
    }
    // Paginación
    const start = (pageFilter.page - 1) * pageFilter.pageSize;
    const paginatedData = gridData.slice(start, start + pageFilter.pageSize);
    return of({
      data: paginatedData,
      total
    });
  }
  
  getUser(userName: string): Observable<User> 
  getUser(id: number): Observable<User> 
  getUser(key: number | string): Observable<User> {
    if (typeof key === 'number') {
      // Buscar por el campo Key (id)
      const user = this._mockData.find(user => user.id === key);
      return of(user!);
    }

    // Buscar por el campo Key (userName)
    const user = this._mockData.find(user => user.userName === key);
    return of(user!);
  }

  addUser(user: User): Observable<User> {
    // Asignar un ID nuevo (simulación)
    const newId = this._mockData.length > 0 ? Math.max(...this._mockData.map(u => u.id!)) + 1 : 1;
    user.id = newId;
    this._mockData.push(user);
    return of(user);
  }

  updateUser(user: User): Observable<User> {
    const index = this._mockData.findIndex(u => u.id === user.id);
    this._mockData[index] = user;
    return of(user);
  }
  
  deleteUser(id: number): Observable<void> {
    this._mockData = this._mockData.filter(user => user.id !== id);
    return of(void 0);
  }

  private _filterUsers(data: User[], filterParameters: UserFilter): User[] {
    if (!filterParameters) {
      return data;
    }
    return data.filter(user => {
      if (filterParameters.id && user.id !== filterParameters.id) {
        return false;
      }
      return true;
    });
  }
}
