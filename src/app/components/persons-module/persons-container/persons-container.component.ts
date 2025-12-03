import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { PersonGridFilterComponent } from './person-grid-filter/person-grid-filter.component';
import { PersonGridComponent } from './person-grid/person-grid.component';
import { PersonFormComponent } from '../person-form/person-form.component';
import { PersonGrid } from '../models/person-grid.model';
import { Person } from '../models/person.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PersonFilter } from '../models/person-filter.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EnumActionsType } from '../../../generic/generic-actions/enums/actions-type.enums';
import { GenericActionsComponent } from '../../../generic/generic-actions/generic-actions.component';
import { ActionService } from '../../../generic/generic-actions/services/actions.service';
import { GridService } from '../../../generic/generic-grid/services/grid.service';
import { GenericLayoutComponent } from '../../../generic/generic-layout/generic-layout.component';
import { EnumMessageType } from '../../../generic/generic-message/enums/message-type.model';
import { GenericMessageComponent } from '../../../generic/generic-message/generic-message';
import { MessagesService } from '../../../generic/generic-message/services/message.service';
import { PageFilter } from '../../../generic/models/page-filter.model';
import { Action } from '../../../generic/generic-actions/models/actions.model';
import { PersonService } from '../services/person.service';
import { ModalService } from '../../../generic/generic-modal/services/modal.service';
import { CONFIRM_DELETE } from '../../../generic/generic-modal/models/modal-messages';
import { TranslatePipe } from '../../../generic/generic-translate/translate.pipe';

@Component({
  selector: 'app-persons-container',
  templateUrl: './persons-container.component.html',
  styleUrls: ['./persons-container.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    AsyncPipe,
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    GenericLayoutComponent,
    GenericMessageComponent,
    GenericActionsComponent,
    PersonGridFilterComponent,
    PersonGridComponent,
    PersonFormComponent,
    
  ],
  providers: [Router, MessagesService, GridService, ActionService]
})
export class PersonsContainerComponent implements OnInit, OnDestroy {
  openedPersonsId: number[] = [];
  selectedPersonId: number | null = null;
  filterParameters: PersonFilter = new PersonFilter();
  
  private openedPersons: Person[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(private _router: Router, private _route: ActivatedRoute, 
    private _personService: PersonService, private _gridService: GridService<PersonGrid>, 
    private _messagesService: MessagesService, private _actionService: ActionService,
    private _modalService: ModalService
) {
    this._createPageFilter();
    this._createFilterParameters();
  }

  ngOnInit(): void {
    try {
      this._loadSecurityActions();
      this.loadPersons(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cargar la pagina", EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }

  onPageChange(pageFilter: PageFilter): void {
    try {
      this._pageFilter = pageFilter;
      this.loadPersons(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al cambiar página", EnumMessageType.Error);
    }
  }

  onFilterApplied(filter: PersonFilter): void {
    try {
      this.filterParameters = filter;
      this.loadPersons(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage("Error al aplicar filtro", EnumMessageType.Error);
    }
  }

  onAction(action: EnumActionsType): void {
    switch (action) {
      case EnumActionsType.actionNew:
        try {
          this._createPerson();
        } catch (error) {
          this._messagesService.addMessage("Error al crear persona", EnumMessageType.Error);
        }
        break;
      case EnumActionsType.actionList:
        try {
          this.openedPersonsId = [];
          this.openedPersons = [];
          this.selectedPersonId = null;
          this._messagesService.addMessage("Generando listado", EnumMessageType.Error);
        } catch (error) {
          this._messagesService.addMessage("Error al cerrar pestañas", EnumMessageType.Error);
        }
    }
  }

  onEdit(person: PersonGrid): void {
    try {
      // Verificar si la persona ya está abierta
      if (this.openedPersonsId.includes(person.id)) {
        this.selectedPersonId = person.id;
        return;
      }
      
      // Obtener la persona completa desde el servicio
      this._personService.getPerson(person.id)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (fullPerson) => {
            this.openedPersonsId.push(person.id);
            this.openedPersons.push(fullPerson);
            this.selectedPersonId = person.id;
          },
          error: () => {
            this._messagesService.addMessage("Error al cargar persona", EnumMessageType.Error);
          }
        });
    } catch (error) {
      this._messagesService.addMessage("Error al editar persona", EnumMessageType.Error);
    }
  }

  onDeletePerson(person: PersonGrid): void {
    try { 
      this._modalService.showModal(CONFIRM_DELETE)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(action => {          
          if (action === EnumActionsType.actionAccept) {
            this._deletePerson(person);
          } 
        });      
    } catch (error) {
      this._messagesService.addMessage("Error al editar persona", EnumMessageType.Error);
    }
  }
  
  onOpenPerson(person: PersonGrid): void {
    try {      
      this._openPerson(person);
    } catch (error) {
      this._messagesService.addMessage("Error al abrir persona en nueva pestaña", EnumMessageType.Error);
    }
  }

  private _openPerson(person: PersonGrid): void {
    try {
      const url = this._router.serializeUrl(
        this._router.createUrlTree(['persons-module', 'persons','open'], { queryParams: { id: person.id } })
      );
      window.open(url, '_blank');
    } catch (error) {
      this._messagesService.addMessage("Error al abrir persona en nueva pestaña", EnumMessageType.Error);
    }
  }

  onSavePerson(person: Person): void {
    const index = this.openedPersonsId.indexOf(person.id);
    if (index !== -1) {
      this.openedPersons[index] = person;
    }
    this._messagesService.addMessage( 'MESSAGE.successSave', EnumMessageType.Info);
    this.loadPersons(this._pageFilter, this.filterParameters);
  }

  onCancelPerson(): void {
    try {      
      if (this.selectedPersonId !== null) {
        this._closePerson(this.selectedPersonId);
      }
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de persona", EnumMessageType.Error);
    }
  }
  onCloseTab(personId: number): void {
    try {
      this._closePerson(personId);
    } catch (error) {
      this._messagesService.addMessage("Error al cerrar pestaña de persona", EnumMessageType.Error);
    }
  }
  
  onClickTab(personId: number): void {    
    this.selectedPersonId = personId;
  }
  
  private _closePerson(personId: number): void {
    const index = this.openedPersonsId.indexOf(personId);
    if (index !== -1) {
      this.openedPersonsId.splice(index, 1);
      this.openedPersons.splice(index, 1);
      
      if (this.openedPersonsId.length > 0) {
        this.selectedPersonId = this.openedPersonsId[Math.max(index - 1, 0)];
      } else {
        this.selectedPersonId = null;
      }
    }
  }

  private _createPerson(): void {
    try {
      const newPerson = new Person();
      newPerson.id = 0;
      newPerson.firstName = 'Nueva';
      newPerson.lastName = 'Persona';
      
      this.openedPersonsId.push(0);
      this.openedPersons.push(newPerson);
      this.selectedPersonId = 0;
    } catch (error) {
      throw error;
    }
  }

  getPersonById(personId: number): Person | undefined {
    const index = this.openedPersonsId.indexOf(personId);
    return index !== -1 ? this.openedPersons[index] : undefined;
  }

  private _deletePerson(person: PersonGrid): void {
    try {
      this._personService.deletePerson(person.id!)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this._messagesService.addMessage("MESSAGE.successDelete", EnumMessageType.Info);
        });
    } catch (error) {
      throw error;
    }
  }


  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.new', EnumActionsType.actionNew, 'add', false),
      new Action('BUTTON.lists', EnumActionsType.actionList, 'list', false)    ];
    this._actionService.setActions(actions);
  }

  private loadPersons(pageFilter: PageFilter, filterParameters: PersonFilter) {
    this._personService.getPersons(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(response => {
        this._gridService.setData(response.data);
      });
  }

  private _createPageFilter() {
    this._pageFilter.page = 1;
    this._pageFilter.pageSize = 5;
    this._pageFilter.sortField = "id";
    this._pageFilter.sortDirection = "asc";
  }

  private _createFilterParameters() {
    this.filterParameters.id = undefined
  }
}
