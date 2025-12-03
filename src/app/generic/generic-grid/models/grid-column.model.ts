import { CustomDatePipe } from "../../pipes";

export class GridColumn<T> {
    constructor(field: keyof T) {
        this.field = field;
    }
    field: keyof T;
    header: string = '';
    sortable: boolean = true;
    align?: 'left' | 'right' | 'center' = 'left';
    width?: string = '25px';
    formatter?: (value: T[keyof T]) => string;
    datePipe?: CustomDatePipe | null = null;

}