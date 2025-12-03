import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Invoice } from '../models/invoice.model';

// Configurar fuentes de pdfMake
(pdfMake as any).vfs = pdfFonts;

@Injectable({
  providedIn: 'root'
})
export class InvoicePdfService {
  
  generateInvoicePDF(invoice: Invoice): void {
    const formatDate = (date: Date): string => {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    const docDefinition: any = {
      header: (currentPage: number, pageCount: number) => {
        return {
          stack: [
            // SECCIÓN 1: MEMBRETE - Datos del emisor y factura (50% cada uno)
            {
              columns: [
                {
                  width: '50%',
                  stack: [
                    { text: 'EMPRESA EMISORA', style: 'sectionHeader' },
                    { text: 'Razón Social: Mi Empresa S.A.', margin: [0, 5, 0, 2] },
                    { text: 'CUIT: 20-12345678-9', margin: [0, 2, 0, 2] },
                    { text: 'Dirección: Calle Falsa 123', margin: [0, 2, 0, 2] },
                    { text: 'Tel: (011) 1234-5678', margin: [0, 2, 0, 2] }
                  ]
                },
                {
                  width: '50%',
                  stack: [
                    { text: 'FACTURA TIPO A', style: 'header', alignment: 'right' },
                    { text: `Nº: ${invoice.invoiceId}`, alignment: 'right', margin: [0, 5, 0, 2] },
                    { text: `Fecha Creación: ${formatDate(invoice.invoiceCreationDate)}`, alignment: 'right', margin: [0, 2, 0, 2] },
                    { text: `Fecha Envío: ${formatDate(invoice.invoiceSentDate)}`, alignment: 'right', margin: [0, 2, 0, 2] }
                  ]
                }
              ],
              margin: [40, 20, 40, 10]
            },
            
            // SECCIÓN 2: CLIENTE (100%)
            {
              canvas: [{ type: 'line', x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 1 }],
              margin: [40, 0, 40, 10]
            },
            {
              stack: [
                { text: 'DATOS DEL CLIENTE', style: 'sectionHeader' },
                { text: `Nombre/Razón Social: ${invoice.personName}`, margin: [0, 5, 0, 2] },
                { text: `Tipo de Documento: ${invoice.personDocumentType}`, margin: [0, 2, 0, 2] },
                { text: `Número de Documento: ${invoice.personDocumentNumber}`, margin: [0, 2, 0, 2] },
                { text: `Descripción: ${invoice.invoiceDescription}`, style: 'description', margin: [0, 5, 0, 0] }
              ],
              margin: [40, 0, 40, 15]
            }
          ]
        };
      },
      content: [
        // SECCIÓN 3: TABLA DE ITEMS
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }],
          margin: [0, 0, 0, 10]
        },
        { text: 'DETALLE DE ITEMS', style: 'sectionHeader', margin: [0, 0, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader', alignment: 'right' },
                { text: 'Precio Unit.', style: 'tableHeader', alignment: 'right' },
                { text: 'Total', style: 'tableHeader', alignment: 'right' }
              ],
              ...this._buildInvoiceItems(invoice)
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex === 0 ? '#4CAF50' : (rowIndex % 2 === 0 ? '#f5f5f5' : null);
            }
          },
          margin: [0, 0, 0, 20]
        },
        
        // SECCIÓN 4: PIE DE PÁGINA - Total en letras (60%) y resumen numérico (40%)
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }],
          margin: [0, 0, 0, 10]
        },
        {
          columns: [
            {
              width: '60%',
              stack: [
                { text: 'TOTAL EN LETRAS:', style: 'sectionHeader', margin: [0, 0, 0, 5] },
                { text: this._numberToWords(this._calculateTotal(invoice)), style: 'totalWords' }
              ]
            },
            {
              width: '40%',
              stack: [
                { 
                  text: `Subtotal: $${this._calculateSubtotal(invoice).toFixed(2)}`, 
                  alignment: 'right',
                  margin: [0, 0, 0, 5]
                },
                { 
                  text: `Impuestos (21%): $${this._calculateTax(invoice).toFixed(2)}`, 
                  alignment: 'right',
                  margin: [0, 0, 0, 5]
                },
                { 
                  text: `TOTAL: $${this._calculateTotal(invoice).toFixed(2)}`, 
                  style: 'total',
                  alignment: 'right'
                }
              ]
            }
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#4CAF50'
        },
        description: {
          fontSize: 10,
          italics: true
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'white'
        },
        total: {
          fontSize: 14,
          bold: true,
          color: '#4CAF50'
        },
        totalWords: {
          fontSize: 11,
          italics: true
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };

    pdfMake.createPdf(docDefinition).download(`factura_${invoice.invoiceId}.pdf`);
  }

  private _buildInvoiceItems(invoice: Invoice): any[] {
    const items: any[] = [];
    
    invoice.items?.forEach(item => {
      items.push([
        item.itemDescription,
        { text: item.itemQuantity.toString(), alignment: 'right' },
        { text: `$${item.itemUnitPrice.toFixed(2)}`, alignment: 'right' },
        { text: `$${item.itemTotalPrice.toFixed(2)}`, alignment: 'right' }
      ]);
    });
    
    return items;
  }

  private _calculateSubtotal(invoice: Invoice): number {
    const total = this._calculateTotal(invoice);
    return total / 1.21; // Asumiendo IVA del 21%
  }

  private _calculateTax(invoice: Invoice): number {
    const subtotal = this._calculateSubtotal(invoice);
    return subtotal * 0.21;
  }

  private _calculateTotal(invoice: Invoice): number {
    return invoice.items?.reduce((total, item) => total + item.itemTotalPrice, 0) || 0;
  }

  private _formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  private _numberToWords(num: number): string {
    const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    let integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    if (integerPart === 0) {
      return `Cero pesos con ${decimalPart}/100`;
    }

    let words = '';
    
    if (integerPart >= 1000) {
      const thousands = Math.floor(integerPart / 1000);
      words += (thousands === 1 ? 'mil ' : units[thousands] + ' mil ');
      integerPart %= 1000;
    }

    if (integerPart >= 100) {
      const hundred = Math.floor(integerPart / 100);
      words += (integerPart === 100 ? 'cien ' : hundreds[hundred] + ' ');
      integerPart %= 100;
    }

    if (integerPart >= 20) {
      const ten = Math.floor(integerPart / 10);
      words += tens[ten];
      integerPart %= 10;
      if (integerPart > 0) {
        words += ' y ' + units[integerPart];
      }
    } else if (integerPart >= 10) {
      words += teens[integerPart - 10];
    } else if (integerPart > 0) {
      words += units[integerPart];
    }

    return `${words.trim().charAt(0).toUpperCase() + words.trim().slice(1)} pesos con ${decimalPart}/100`;
  }

}
