import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { EnumLiteralKeys } from '@lib/common';
import {
  CustomDatePipe, GenericGridComponent, GridColumn, GridColumnConfiguration,
  GridConfiguration, GridConfigurationService, GridService, PageFilter, TranslationService
} from '@lib/shared';
import { AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import { CompanyGrid } from '../../models/company-grid.model';

@Component({
  selector: 'app-company-grid',
  templateUrl: './company-grid.component.html',
  styleUrls: ['./company-grid.component.scss'],
  standalone: true,
  imports: [GenericGridComponent]
})
export class CompanyGridComponent implements OnInit {
  readonly literalKey: EnumLiteralKeys = EnumLiteralKeys.eGrid_Companies;

  @Output() edit = new EventEmitter<CompanyGrid>();
  @Output() delete = new EventEmitter<CompanyGrid>();
  @Output() open = new EventEmitter<CompanyGrid>();
  @Output() sortChange = new EventEmitter<PageFilter>();
  @Output() scrollEndChange = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<PageFilter>();

  columns: GridColumn<CompanyGrid>[] = [];

  private _customDatePipe: CustomDatePipe;

  constructor(
    private _gridService: GridService<CompanyGrid>,
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

  onEdit(company: CompanyGrid): void { this.edit.emit(company); }
  onDelete(company: CompanyGrid): void { this.delete.emit(company); }
  onOpen(company: CompanyGrid): void { this.open.emit(company); }

  onSortChange(event: Sort): void {
    const pageFilter = new PageFilter();
    pageFilter.sortField = event.active;
    pageFilter.sortDirection = event.direction;
    this.sortChange.emit(pageFilter);
  }

  onLoadNextPage(): void { this.scrollEndChange.emit(); }

  private _initializeColumns(): void {
    this.columns = [
      { field: 'company_id', header: 'LABEL.number', sortable: true, align: 'right', width: '120px' },
      { field: 'company_razonSocial', header: 'LABEL.razonSocial', sortable: true, width: '280px' },
      { field: 'company_tipo', header: 'LABEL.type', sortable: true, width: '160px' },
      { field: 'company_estado', header: 'LABEL.status', sortable: true, width: '140px' },
      { field: 'company_observacion', header: 'LABEL.observacion', sortable: true, width: '260px' }
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
  ): GridColumn<CompanyGrid> {
    return {
      field: colConfig.gridColumnField as keyof CompanyGrid,
      header: colConfig.gridColumnHeader,
      sortable: colConfig.gridColumnSortable,
      width: colConfig.gridColumnWidth,
      align: colConfig.gridColumnAlign as any
    };
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eGrid_Companies,
      this.makeConditions()
    );
    this._gridService.setActions(actions);
  }

  makeConditions(): string { return '#|V|#'; }
}




