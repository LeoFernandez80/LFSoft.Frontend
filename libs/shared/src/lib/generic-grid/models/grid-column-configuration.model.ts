export class GridColumnConfiguration { 
    gridId: number = 0;
    gridColumnId: number = 0;   
    gridColumnPosition: number = 0;
    gridColumnField: string= '';
    gridColumnHeader: string = '';
    gridColumnSortable: boolean = true;
    gridColumnAlign?: 'left' | 'right' | 'center' = 'left';
    gridColumnWidth?: string = '25px';        
    gridColumnVisible: boolean = true;
    gridColumnFixed: boolean = false;
    gridColumnHeaderBackgroundColor?: string = undefined;
    gridColumnHeaderTextColor?: string = undefined;
    gridColumnCellBackgroundColor?: string = undefined;
    gridColumnCellActionsBackgroundColor?: string = undefined;
    gridColumnCellTextColor?: string = undefined;
    gridColumnDateFormat?: boolean = false;
}
