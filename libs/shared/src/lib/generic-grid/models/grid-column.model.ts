import { CustomDatePipe } from '../../pipes/custom-date.pipe';

export class GridColumn<T> {
    constructor(field: keyof T) {
        this.field = field;
    }
    position?: number = 0;
    field: keyof T;
    header: string = '';
    sortable: boolean = true;
    align?: 'left' | 'right' | 'center' = 'left';
    width?: string = '25px';
    visible?: boolean = true;
    headerBackgroundColor?: string = undefined;
    headerTextColor?: string = undefined;
    cellBackgroundColor?: string = undefined;
    cellTextColor?: string = undefined;
    cellActionsBackgroundColor?: string = undefined;
    formatter?: (value: T[keyof T]) => string;
    datePipe?: CustomDatePipe | null = null;
}
