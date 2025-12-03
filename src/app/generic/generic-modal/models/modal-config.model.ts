export interface IModalConfig {
    text: string;
    icon?: string;
    title: string;
    showCloseButton?: boolean;
    showActions?: boolean;
    acceptLabel?: string;
    cancelLabel?: string;
    blockClose?: boolean; // Si es true, solo se podrá cerrar mediante las acciones
}