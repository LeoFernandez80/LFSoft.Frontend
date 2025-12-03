import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { PaginatedList } from '../../../generic/models/paginated-list.model';
import { PersonFilter } from '../models/person-filter.model';
import { Person } from '../models/person.model';
import { PersonGrid } from '../models/person-grid.model';

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
    { id: 10, firstName: 'Henry', lastName: 'Anderson', email: 'henry.anderson@example.com', birthDate: new Date('1984-08-08') },
    { id: 11, firstName: 'Lucía', lastName: 'Fernández', email: 'lucia.fernandez@example.com', birthDate: new Date('1996-02-14') },
    { id: 12, firstName: 'Miguel', lastName: 'Torres', email: 'miguel.torres@example.com', birthDate: new Date('1989-10-23') },
    { id: 13, firstName: 'Sofía', lastName: 'Gómez', email: 'sofia.gomez@example.com', birthDate: new Date('1994-07-12') },
    { id: 14, firstName: 'Carlos', lastName: 'Ruiz', email: 'carlos.ruiz@example.com', birthDate: new Date('1983-05-30') },
    { id: 15, firstName: 'Valentina', lastName: 'López', email: 'valentina.lopez@example.com', birthDate: new Date('1997-11-18') },
    { id: 16, firstName: 'Martín', lastName: 'Castro', email: 'martin.castro@example.com', birthDate: new Date('1986-03-22') },
    { id: 17, firstName: 'Paula', lastName: 'Santos', email: 'paula.santos@example.com', birthDate: new Date('1992-09-17') },
    { id: 18, firstName: 'Javier', lastName: 'Méndez', email: 'javier.mendez@example.com', birthDate: new Date('1981-12-03') },
    { id: 19, firstName: 'Camila', lastName: 'Vega', email: 'camila.vega@example.com', birthDate: new Date('1998-06-27') },
    { id: 20, firstName: 'Andrés', lastName: 'Silva', email: 'andres.silva@example.com', birthDate: new Date('1987-04-11') },
    { id: 21, firstName: 'María', lastName: 'Pérez', email: 'maria.perez@example.com', birthDate: new Date('1993-08-19') },
    { id: 22, firstName: 'Federico', lastName: 'Ramos', email: 'federico.ramos@example.com', birthDate: new Date('1985-02-28') },
    { id: 23, firstName: 'Natalia', lastName: 'Morales', email: 'natalia.morales@example.com', birthDate: new Date('1990-10-10') },
    { id: 24, firstName: 'Agustina', lastName: 'Flores', email: 'agustina.flores@example.com', birthDate: new Date('1996-01-05') },
    { id: 25, firstName: 'Ricardo', lastName: 'Sosa', email: 'ricardo.sosa@example.com', birthDate: new Date('1984-07-14') },
    { id: 26, firstName: 'Patricia', lastName: 'Herrera', email: 'patricia.herrera@example.com', birthDate: new Date('1991-03-29') },
    { id: 27, firstName: 'Gustavo', lastName: 'Navarro', email: 'gustavo.navarro@example.com', birthDate: new Date('1982-11-21') },
    { id: 28, firstName: 'Florencia', lastName: 'Cabrera', email: 'florencia.cabrera@example.com', birthDate: new Date('1995-05-09') },
    { id: 29, firstName: 'Sebastián', lastName: 'Ibarra', email: 'sebastian.ibarra@example.com', birthDate: new Date('1988-09-16') },
    { id: 30, firstName: 'Elena', lastName: 'Ortiz', email: 'elena.ortiz@example.com', birthDate: new Date('1999-12-01') }
  ];

  getPersons(pageFilter: PageFilter, filterParameters: PersonFilter): Observable<PaginatedList<PersonGrid>> {
    let filteredData = this._filterPersons(this._mockData, filterParameters);
    const total = filteredData.length;
    // Map to PersonGrid
    let gridData: PersonGrid[] = filteredData.map(person => ({
      selected: false,
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName
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

  getPerson(id: number): Observable<Person> {
    // Buscar por el campo Key (id)
    const person = this._mockData.find(person => person.id === id);
    return of(person!);
  }

  addPerson(person: Person): Observable<Person> {
    // Asignar un ID nuevo (simulación)
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
  /**
   * Filtra el array de personas según los parámetros de filtro.
   */
  private _filterPersons(data: Person[], filter: PersonFilter): Person[] {
    return data.filter(person => {
      let matches = true;
      if (filter.id && person.id !== filter.id) matches = false;
      // Si se agregan más campos a PersonFilter, agregar aquí
      return matches;
    });
  }
}
