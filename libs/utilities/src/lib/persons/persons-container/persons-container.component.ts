import { NgFor } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ConfigurationItem, ConfigurationService, EnumActions, EnumLiteralKeys } from '@lib/common';
import {
  ActionService, CONFIRM_DELETE, EnumActionsType, EnumMessageType,
  GenericActionsComponent, GenericLayoutComponent, GenericMessageComponent,
  GridService, MessagesService, ModalService, PageFilter, TranslatePipe
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { PersonFormComponent } from '../person-form/person-form.component';
import { HTTPServicePerson } from '../http-services/person.service';
import { PersonFilter } from '../models/person-filter.model';
import { PersonGrid } from '../models/person-grid.model';
import { Person } from '../models/person.model';
import { PersonGridComponent } from './person-grid/person-grid.component';
import { PersonGridFilterComponent } from './person-grid-filter/person-grid-filter.component';

@Component({
  selector: 'app-persons-container',
  templateUrl: './persons-container.component.html',
  styleUrls: ['./persons-container.component.scss'],
  standalone: true,
  imports: [
    NgFor, MatTabsModule, MatIconModule, TranslatePipe,
    GenericLayoutComponent, GenericMessageComponent, GenericActionsComponent,
    PersonGridFilterComponent, PersonGridComponent, PersonFormComponent
  ],
  providers: [Router, MessagesService, GridService]
})
export class PersonsContainerComponent implements OnInit, OnDestroy {
  openedPersonsId: number[] = [];
  selectedPersonId: number = 0;
  selectedTabIndex: number = -1;
  filterParameters: PersonFilter = new PersonFilter();
  config: ConfigurationItem = new ConfigurationItem();

  private _dataLoaded: PersonGrid[] = [];
  private _openedPersons: Person[] = [];
  private _pageFilter: PageFilter = new PageFilter();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _router: Router,
    private _personService: HTTPServicePerson,
    private _gridService: GridService<PersonGrid>,
    private _messagesService: MessagesService,
    private _actionService: ActionService,
    private _modalService: ModalService,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService,
    private _configurationService: ConfigurationService
  ) {
    this._createPageFilter();
    this._createFilterParameters();
    this._setSubscriptions();
  }

  ngOnInit(): void {
    try {
      this._securityApply();
      this.loadPersons(this._pageFilter, this.filterParameters);
    } catch (error) {
      this._messagesService.addMessage('Error al cargar la pagina', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {}

  onSortChange(pageFilter: PageFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this._pageFilter.sortDirection = pageFilter.sortDirection;
    this._pageFilter.sortField = pageFilter.sortField;
    this.loadPersons(this._pageFilter, this.filterParameters);
  }

  onLoadNextPage(): void {
    this._pageFilter.page += 1;
    this.loadPersons(this._pageFilter, this.filterParameters);
  }

  onFilterApplied(filter: PersonFilter): void {
    this._dataLoaded = [];
    this._pageFilter.page = 1;
    this.filterParameters = filter;
    this.loadPersons(this._pageFilter, this.filterParameters);
  }

  onAction(action: EnumActionsType | EnumActions): void {
    if (action === EnumActions.eAction_New) { this._actionNewPerson(); }
  }

  onEdit(person: PersonGrid): void {
    try {
      if (this.openedPersonsId.includes(person.person_id)) {
        this.selectedPersonId = person.person_id;
        this.selectedTabIndex = this.openedPersonsId.indexOf(person.person_id);
        return;
      }
      const fullPerson = this._personGridToPerson(person);
      this.openedPersonsId.push(fullPerson.person_id);
      this._openedPersons.push(fullPerson);
      this.selectedPersonId = fullPerson.person_id;
      this.selectedTabIndex = this.openedPersonsId.indexOf(fullPerson.person_id);
    } catch (error) {
      this._messagesService.addMessage('Error al editar entidad', EnumMessageType.Error);
    }
  }

  onDeletePerson(person: PersonGrid): void {
    this._modalService.showModal(CONFIRM_DELETE).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(action => {
      if (action === EnumActionsType.actionAccept) { this._deletePerson(person); }
    });
  }

  onOpenPerson(person: PersonGrid): void {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['persons-module', 'person', 'open'], { queryParams: { id: person.person_id } })
    );
    window.open(url, '_blank');
  }

  onSavePerson(person: Person): void {
    const openedIndex = this.openedPersonsId.indexOf(person.person_id);
    if (openedIndex !== -1) {
      this._openedPersons[openedIndex] = person;
      this.openedPersonsId[openedIndex] = person.person_id;
    } else {
      this.openedPersonsId.push(person.person_id);
      this._openedPersons.push(person);
    }

    const gridIndex = this._dataLoaded.findIndex(item => item.person_id === person.person_id);
    if (gridIndex !== -1) {
      this._dataLoaded[gridIndex] = this._mapPersonToGrid(person);
    } else {
      this._dataLoaded = [this._mapPersonToGrid(person), ...this._dataLoaded];
    }

    this._gridService.setData(this._dataLoaded);
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
    this.selectedPersonId = person.person_id;
    this.selectedTabIndex = this.openedPersonsId.indexOf(person.person_id);
  }

  onCancelPerson(): void {
    if (this.selectedPersonId !== null) { this._closePerson(this.selectedPersonId); }
  }

  onCloseTab(personId: number): void { this._closePerson(personId); }

  onClickTab(personId: number): void {
    this.selectedPersonId = personId;
    this.selectedTabIndex = this.openedPersonsId.indexOf(personId);
  }

  getPersonById(personId: number): Person | undefined {
    const index = this.openedPersonsId.indexOf(personId);
    return index !== -1 ? this._openedPersons[index] : undefined;
  }

  loadPersons(pageFilter: PageFilter, filterParameters: PersonFilter): void {
    this._personService.getPersons(pageFilter, filterParameters)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: response => {
          this._dataLoaded = this._pageFilter.page === 1 ? response.data : [...this._dataLoaded, ...response.data];
          this._gridService.setData(this._dataLoaded);
        },
        error: () => { this._messagesService.addMessage('Error al cargar entidades', EnumMessageType.Error); }
      });
  }

  private _actionNewPerson(): void {
    const newPerson = new Person();
    newPerson.person_id = 0;
    this.openedPersonsId.push(0);
    this._openedPersons.push(newPerson);
    this.selectedPersonId = 0;
    this.selectedTabIndex = this.openedPersonsId.indexOf(0);
  }

  private _closePerson(personId: number): void {
    const index = this.openedPersonsId.indexOf(personId);
    if (index !== -1) {
      this.openedPersonsId.splice(index, 1);
      this._openedPersons.splice(index, 1);
      this.selectedPersonId = this.openedPersonsId.length > 0
        ? this.openedPersonsId[Math.max(index - 1, 0)]
        : 0;
    }
    this.selectedTabIndex = this.selectedPersonId !== null ? this.openedPersonsId.indexOf(this.selectedPersonId) : -1;
  }

  private _deletePerson(person: PersonGrid): void {
    this._personService.deletePerson(person.person_id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._dataLoaded = this._dataLoaded.filter(item => item.person_id !== person.person_id);
          this._gridService.setData(this._dataLoaded);
          this._closePerson(person.person_id);
          this._messagesService.addMessage('MESSAGE.successDelete', EnumMessageType.Info);
        },
        error: () => { this._messagesService.addMessage('Error al eliminar entidad', EnumMessageType.Error); }
      });
  }

  private _personGridToPerson(personGrid: PersonGrid): Person {
    const person = new Person();
    person.person_id = personGrid.person_id;
    person.person_name = personGrid.person_name;
    person.person_lastname = personGrid.person_lastname;
    person.person_nickname = personGrid.person_nickname;
    person.person_fullname = personGrid.person_fullname;
    person.person_active = personGrid.person_active;
    person.person_maritalStatus = personGrid.person_maritalStatus;
    return person;
  }

  private _mapPersonToGrid(person: Person): PersonGrid {
    const grid = new PersonGrid();
    grid.person_id = person.person_id;
    grid.person_name = person.person_name;
    grid.person_lastname = person.person_lastname;
    grid.person_nickname = person.person_nickname;
    grid.person_fullname = person.person_fullname;
    grid.person_active = person.person_active;
    grid.person_maritalStatus = person.person_maritalStatus;
    return grid;
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eModule_Persons,
      this.makeConditions()
    );
    this._actionService.setActions(actions);
  }

  makeConditions(): string { return '#|V|#'; }

  private _setSubscriptions(): void {
    this._configurationService.getConfiguration()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(config => {
        if (config) {
          this.config = config.items.find(c => c.literalKey === EnumLiteralKeys.eModule_Persons) || new ConfigurationItem();
        }
      });
  }

  private _createPageFilter(): void { this._pageFilter = new PageFilter(); }
  private _createFilterParameters(): void { this.filterParameters = new PersonFilter(); }
}
