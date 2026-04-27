import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PersonFilter } from '../models/person-filter.model';
import { Person } from '../models/person.model';
import { PersonGrid } from '../models/person-grid.model';
import { PageFilter, PaginatedList } from '@lib/shared';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private _mockData: Person[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', birthDate: new Date('1990-01-01') },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', birthDate: new Date('1985-05-15') },
    { id: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', birthDate: new Date('1992-07-20') },
    { id: 4, firstName: 'Bob', lastName: 'Williams', email: 'bob.williams@example.com', birthDate: new Date('1988-03-10') },
    { id: 5, firstName: 'Carol', lastName: 'Brown', email: 'carol.brown@example.com', birthDate: new Date('1995-11-30') },
    { id: 6, firstName: 'David', lastName: 'Miller', email: 'david.miller@example.com', birthDate: new Date('1982-09-25') },
    { id: 7, firstName: 'Eva', lastName: 'Davis', email: 'eva.davis@example.com', birthDate: new Date('1993-04-05') },
    { id: 8, firstName: 'Frank', lastName: 'Garcia', email: 'frank.garcia@example.com', birthDate: new Date('1987-12-15') },
    { id: 9, firstName: 'Grace', lastName: 'Martinez', email: 'grace.martinez@example.com', birthDate: new Date('1991-06-20') },
    { id: 10, firstName: 'Henry', lastName: 'Anderson', email: 'henry.anderson@example.com', birthDate: new Date('1984-08-08') }
  ];

  getPersons(pageFilter: PageFilter, filterParameters: PersonFilter): Observable<PaginatedList<PersonGrid>> {
    let filteredData = this._filterPersons(this._mockData, filterParameters);
    const total = filteredData.length;
    let gridData: PersonGrid[] = filteredData.map(person => ({
      selected: false,
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName
    }));
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
    const start = (pageFilter.page - 1) * pageFilter.pageSize;
    const paginatedData = gridData.slice(start, start + pageFilter.pageSize);
    return of({
      data: paginatedData,
      total
    });
  }

  getPerson(id: number): Observable<Person> {
    const person = this._mockData.find(person => person.id === id);
    return of(person!);
  }

  addPerson(person: Person): Observable<Person> {
    const newId = this._mockData.length > 0 ? Math.max(...this._mockData.map(p => p.id!)) + 1 : 1;
    person.id = newId;
    this._mockData.push(person);
    return of(person);
  }

  updatePerson(person: Person): Observable<Person> {
    const index = this._mockData.findIndex(p => p.id === person.id);
    this._mockData[index] = person;
    return of(person);
  }
  
  deletePerson(id: number): Observable<void> {
    this._mockData = this._mockData.filter(person => person.id !== id);
    
    return of(void 0);
  }
  private _filterPersons(data: Person[], filter: PersonFilter): Person[] {
    return data.filter(person => {
      let matches = true;
      if (filter.id && person.id !== filter.id) matches = false;
      return matches;
    });
  }
}
