import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumLiteralKeys } from '@lib/common';
import {
  CustomDatePipe, GenericGridComponent, GridColumn, GridColumnConfiguration,
  GridConfiguration, GridConfigurationService, GridService, PageFilter, TranslationService
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { PersonGrid } from '../../models/person-grid.model';

@Component({
  selector: 'app-person-grid',
  templateUrl: './person-grid.component.html',
  styleUrls: ['./person-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent]
})
export class PersonGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_Persons;

  @Output() edit = new EventEmitter<PersonGrid>();
  @Output() delete = new EventEmitter<PersonGrid>();
  @Output() open = new EventEmitter<PersonGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();

  columns: GridColumn<PersonGrid>[] = [];

  private _customDatePipe: CustomDatePipe;

  constructor(
    private _gridService: GridService<PersonGrid>,
    private _translationService: TranslationService,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService,
    private _gridConfigurationService: GridConfigurationService
  ) {
    this._customDatePipe = new CustomDatePipe();
    this._loadGridConfiguration();
  }

  ngOnInit(): void {
    this._gridService.setColumns(this.columns);
    this._securityApply();
  }

  onEdit(person: PersonGrid): void { this.edit.emit(person); }
  onDelete(person: PersonGrid): void { this.delete.emit(person); }
  onOpen(person: PersonGrid): void { this.open.emit(person); }

  onSortChange(event: Sort): void {
    const pageFilter = new PageFilter();
    pageFilter.sortField = event.active;
    pageFilter.sortDirection = event.direction;
    this.sortChange.emit(pageFilter);
  }

  onLoadNextPage(): void { this.scrollEndChange.emit(); }

  private _initializeColumns(): void {
    this.columns = [
      { field: 'person_id', header: 'LABEL.number', sortable: true, align: 'right', width: '120px' },
      { field: 'person_fullname', header: 'LABEL.fullName', sortable: true, width: '280px' },
      { field: 'person_nickname', header: 'LABEL.nickname', sortable: true, width: '200px' },
      { field: 'person_maritalStatus', header: 'LABEL.maritalStatus', sortable: true, width: '180px' },
      { field: 'person_active', header: 'LABEL.active', sortable: true, width: '120px' }
    ];
  }

  private _loadGridConfiguration(): void {
    this._gridConfigurationService.getUserGridConfiguration(this.literalKey).subscribe(userConfiguration => {
      if (userConfiguration) {
        this.columns = userConfiguration.gridColumns
          .filter(colConfig => colConfig.gridColumnVisible)
          .map(colConfig => this._mapConfigurationColumnToColumn(userConfiguration, colConfig));
        this._gridService.setColumns(this.columns);
      } else {
        this._initializeColumns();
      }
    });
  }

  private _mapConfigurationColumnToColumn(
    config: GridConfiguration,
    colConfig: GridColumnConfiguration
  ): GridColumn<PersonGrid> {
    return {
      field: colConfig.gridColumnField as keyof PersonGrid,
      header: colConfig.gridColumnHeader,
      sortable: colConfig.gridColumnSortable,
      width: colConfig.gridColumnWidth,
      align: colConfig.gridColumnAlign as any
    };
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eGrid_Persons,
      this.makeConditions()
    );
    this._gridService.setActions(actions);
  }

  makeConditions(): string { return '#|V|#'; }
}
