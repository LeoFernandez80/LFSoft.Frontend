import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { GridConfiguration } from '../models/grid-configuration.model';
import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';

@Injectable({
  providedIn: 'root'
})
export class GridConfigurationService {
  private _mockData: Map<string, GridConfiguration> = new Map();

  private _userGridsConfigurations: GridConfiguration[] = [];
  private _userGridConfigurations$: BehaviorSubject<GridConfiguration> ;
  
  constructor() { 
    this._loadGridConfigurationsMOCK();
    this._userGridConfigurations$ = new BehaviorSubject<GridConfiguration>(new GridConfiguration());
  }
  
  
  loadUserGridConfiguration(userId: string): Observable<GridConfiguration[] | null> {
    //Este metodo iria en el servicio HTTP y debería llamar a la BD para cargar la configuración del usuario por su userId, pero por ahora devuelve un mock
    console.log("setUserGridConfiguration", userId);
    const userGridsConfigurations: GridConfiguration[] = [];
    this._mockData.forEach((value, key) => {
      if (value.userId === userId) {        
        userGridsConfigurations.push(value);
      }
    });
    
    return of(userGridsConfigurations);
  }
  
  setUserGridConfiguration(config: GridConfiguration[]): void {
    //guardar en la BD la configuración por el userId  
    this._userGridsConfigurations = config;
    localStorage.setItem('userGridConfigurations', JSON.stringify(config) );
    //this._userGridConfigurations$.next(config);
  }

    // setUserGridConfiguration(typeLiteralKey: string, config: GridConfiguration): void {
    //   //guardar en la BD la configuración por el userId
    //   this._mockData.set(typeLiteralKey, config);
    //   this._userGridsConfigurations.set(typeLiteralKey, config);
    //   this._userGridConfigurations$.next(config);
    // }
  
    getUserGridConfiguration(typeLiteralKey: string): Observable<GridConfiguration | null> {
      //Este metodo iria en el servicio HTTP y debería llamar a la BD para cargar la configuración del usuario por su userId, pero por ahora devuelve un mock
      const storedConfig = localStorage.getItem('userGridConfigurations');
      if (storedConfig) {
        this._userGridsConfigurations = JSON.parse(storedConfig);
        console.log("getUserGridConfiguration", typeLiteralKey, this._userGridsConfigurations);
      }
      const config = this._userGridsConfigurations.find(c => c.gridTypeLiteralKey === typeLiteralKey) || null;

      return of(config);
    }

    saveUserGridConfiguration(config: GridConfiguration): void {
      // Este método debería llamar a un servicio HTTP para guardar en BD
      // Por ahora actualiza el mock y localStorage
      const index = this._userGridsConfigurations.findIndex(c => 
        c.gridTypeLiteralKey === config.gridTypeLiteralKey && c.userId === config.userId
      );
      
      if (index !== -1) {
        this._userGridsConfigurations[index] = config;
      } else {
        this._userGridsConfigurations.push(config);
      }
      
      localStorage.setItem('userGridConfigurations', JSON.stringify(this._userGridsConfigurations));
      this._mockData.set(`${config.gridTypeLiteralKey}.${config.userId}`, config);
    }
  
    private _loadGridConfigurationsMOCK(): void {
      const config1: GridConfiguration = {
        userId: "08adba81-69e8-42cf-b990-36d1a1d13574",
        gridConfigurationId: 1,
        gridTypeLiteralKey: EnumLiteralKeys.eGrid_Users,
        gridName: 'User Grid',
        gridHeaderBackgroundColor: 'var(--grid-header-primary-bg)',
        gridHeaderTextColor: 'var(--grid-header-primary-text)',
        gridCellBackgroundColor: 'var(--grid-primary-bg)',
        gridCellTextColor: 'var(--grid-primary-text)',
        gridHighlightColor: 'var(--grid-row-highlight-primary-bg)',
        gridMouseOverColor: 'var(--grid-row-mouseover-primary-bg)',
        gridCellActionsBackgroundColor: 'var(--grid-primary-bg)',
        gridColumns: [          
          {
            gridColumnId: 2,
            gridId: 1,
            gridColumnPosition: 2,
            gridColumnField: 'user_firstName',
            gridColumnHeader: 'LABEL.firstName',
            gridColumnAlign: 'left',
            gridColumnWidth: '100px',
            gridColumnSortable: true,
            gridColumnVisible: true,
            gridColumnFixed: true
          },
          {
            gridColumnId: 3,
            gridId: 1,
            gridColumnPosition: 3,
            gridColumnField: 'user_lastName',
            gridColumnHeader: 'LABEL.lastName',
            gridColumnAlign: 'left',
            gridColumnSortable: true,
            gridColumnVisible: true,
            gridColumnFixed: true
          }        
        ]
      } 
      this._mockData.set(`${config1.gridTypeLiteralKey}.${config1.userId}`, config1);

      const config2: GridConfiguration = {
        userId: "42d1037c-366e-4431-bdde-2a93b9d31f49",
        gridConfigurationId: 1,
        gridTypeLiteralKey: EnumLiteralKeys.eGrid_Users,
        gridName: 'User Grid',
        gridHeaderBackgroundColor: 'var(--grid-header-primary-bg)',
        gridHeaderTextColor: 'var(--grid-header-primary-text)',
        gridCellBackgroundColor: 'var(--grid-primary-bg)',
        gridCellTextColor: 'var(--grid-primary-text)',
        gridHighlightColor: 'var(--grid-row-highlight-primary-bg)',
        gridMouseOverColor: 'var(--grid-row-mouseover-primary-bg)',
        gridCellActionsBackgroundColor: 'var(--grid-primary-bg)',
        gridColumns: [
          {
            gridColumnId: 1,
            gridId: 1,
            gridColumnPosition: 1,
            gridColumnField: 'user_email',
            gridColumnHeader: 'LABEL.email',
            gridColumnAlign: 'left',
            gridColumnSortable: true,
            gridColumnVisible: true,        
            gridColumnFixed: true,  
          },
          {
            gridColumnId: 2,
            gridId: 1,
            gridColumnPosition: 2,
            gridColumnField: 'user_active',
            gridColumnHeader: 'LABEL.active',
            gridColumnAlign: 'left',
            gridColumnSortable: true,
            gridColumnVisible: true,        
            gridColumnFixed: true,  
          },
        ]
      }
      this._mockData.set(`${config2.gridTypeLiteralKey}.${config2.userId}`, config2);
    }
      

  // getGridConfigurationByKey(userId: string, typeLiteralKey: string): Observable<GridConfiguration> {
  //   const config = this._mockData{}.find(cfg => cfg.userId === userId && cfg.gridTypeLiteralKey === typeLiteralKey);    
  //   return of(config!);
  // }

  // addGridConfiguration(config: GridConfiguration): Observable<GridConfiguration> {
  //   this._mockData.push(config);
  //   return of(config);    
  // }

  // updateGridConfiguration(config: GridConfiguration): Observable<GridConfiguration> {
  //   const index = this._mockData.findIndex(cfg => cfg.gridConfigurationId === config.gridConfigurationId);
  //   if (index !== -1) {
  //     this._mockData[index] = config;
  //   } 
  //   return of(config);   
  // }
}
