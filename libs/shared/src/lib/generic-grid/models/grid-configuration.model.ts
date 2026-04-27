import { EnumLiteralKeys } from 'libs/common/src/lib/enums/literal-keys.enum';
import { CustomDatePipe } from '../../pipes/custom-date.pipe';
import { GridColumnConfiguration } from './grid-column-configuration.model';

export class GridConfiguration {    
    userId: string = '';
    gridConfigurationId: number = 0;
    gridTypeLiteralKey: EnumLiteralKeys = EnumLiteralKeys.eLiteralKey_Empty;    
    gridName: string = '';    
    gridHeaderBackgroundColor?: string = undefined;
    gridHeaderTextColor?: string = undefined
    gridCellBackgroundColor?: string = undefined;    
    gridCellTextColor?: string = undefined;
    gridHighlightColor?: string = undefined;
    gridMouseOverColor?: string = undefined;
    gridCellActionsBackgroundColor?: string = undefined;
    gridColumns: GridColumnConfiguration[] = [];
}
