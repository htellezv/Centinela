import { Cliente, Prospecto, Venta, Gasto, Renovacion, Tarea } from './types';

/**
 * Exports a list of clients to a downloadable Excel-compatible CSV file
 * utilizing a UTF-8 Byte Order Mark (BOM) to preserve accents and formatting in Excel.
 */
export function exportClientesToCSV(clientes: Cliente[]) {
  // Define columns in Spanish matching the sheet and requirements
  const headers = [
    'ID',
    'Empresa',
    'Contacto',
    'Teléfono',
    'Correo',
    'Servicio',
    'Valor',
    'Fecha Inicio',
    'Fecha Vencimiento',
    'Estado',
    'Observaciones'
  ];

  // Helper to escape CSV values safely (wrapping in quotes, doubling quotes if existing)
  const escapeCSVValue = (val: any) => {
    if (val === null || val === undefined) return '';
    let stringVal = String(val);
    // Replace double quotes with two double quotes
    if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
      stringVal = `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvRows = [
    headers.join(','), // Header row
    ...clientes.map(c => [
      escapeCSVValue(c.id),
      escapeCSVValue(c.empresa),
      escapeCSVValue(c.contacto),
      escapeCSVValue(c.telefono),
      escapeCSVValue(c.correo),
      escapeCSVValue(c.servicio),
      escapeCSVValue(c.valor),
      escapeCSVValue(c.fechaInicio),
      escapeCSVValue(c.fechaVencimiento),
      escapeCSVValue(c.estado),
      escapeCSVValue(c.observaciones)
    ].join(','))
  ];

  // UTF-8 BOM to ensure proper character encoding when opened in Excel
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary link to download the file
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `Centinela_Clientes_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports a list of prospectos to a downloadable Excel-compatible CSV file.
 */
export function exportProspectosToCSV(prospectos: Prospecto[]) {
  const headers = [
    'ID',
    'Empresa',
    'Contacto',
    'Teléfono',
    'Correo',
    'Servicio de interés',
    'Valor estimado',
    'Estado',
    'Último contacto',
    'Próximo seguimiento',
    'Observaciones'
  ];

  const escapeCSVValue = (val: any) => {
    if (val === null || val === undefined) return '';
    let stringVal = String(val);
    if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
      stringVal = `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvRows = [
    headers.join(','),
    ...prospectos.map(p => [
      escapeCSVValue(p.id),
      escapeCSVValue(p.empresa),
      escapeCSVValue(p.contacto),
      escapeCSVValue(p.telefono),
      escapeCSVValue(p.correo),
      escapeCSVValue(p.servicioInteres),
      escapeCSVValue(p.valorEstimado),
      escapeCSVValue(p.estado),
      escapeCSVValue(p.ultimoContacto),
      escapeCSVValue(p.proximoSeguimiento),
      escapeCSVValue(p.observaciones)
    ].join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `Centinela_Prospectos_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates the next sequential Client ID.
 * Finds the highest numeric value from existing ID strings like "CLI-001" and increments it.
 */
export function generateNextId(clientes: Cliente[]): string {
  if (clientes.length === 0) {
    return 'CLI-001';
  }

  let maxNum = 0;
  clientes.forEach(c => {
    if (c.id && c.id.startsWith('CLI-')) {
      const numPart = c.id.replace('CLI-', '');
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  return `CLI-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Generates the next sequential Prospecto ID.
 */
export function generateNextProspectoId(prospectos: Prospecto[]): string {
  if (prospectos.length === 0) {
    return 'PRO-001';
  }

  let maxNum = 0;
  prospectos.forEach(p => {
    if (p.id && p.id.startsWith('PRO-')) {
      const numPart = p.id.replace('PRO-', '');
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  return `PRO-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Exports a list of ventas to a downloadable Excel-compatible CSV file.
 */
export function exportVentasToCSV(ventas: Venta[]) {
  const headers = [
    'ID',
    'Cliente',
    'Servicio',
    'Valor',
    'Fecha',
    'Estado de pago',
    'Fecha Inicio',
    'Fecha Renovación',
    'Observaciones'
  ];

  const escapeCSVValue = (val: any) => {
    if (val === null || val === undefined) return '';
    let stringVal = String(val);
    if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
      stringVal = `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvRows = [
    headers.join(','),
    ...ventas.map(v => [
      escapeCSVValue(v.id),
      escapeCSVValue(v.cliente),
      escapeCSVValue(v.servicio),
      escapeCSVValue(v.valor),
      escapeCSVValue(v.fecha),
      escapeCSVValue(v.estadoPago),
      escapeCSVValue(v.fechaInicio),
      escapeCSVValue(v.fechaRenovacion),
      escapeCSVValue(v.observaciones)
    ].join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `Centinela_Ventas_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates the next sequential Venta ID.
 */
export function generateNextVentaId(ventas: Venta[]): string {
  if (ventas.length === 0) {
    return 'VEN-001';
  }

  let maxNum = 0;
  ventas.forEach(v => {
    if (v.id && v.id.startsWith('VEN-')) {
      const numPart = v.id.replace('VEN-', '');
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  return `VEN-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Exports a list of gastos to a downloadable Excel-compatible CSV file.
 */
export function exportGastosToCSV(gastos: Gasto[]) {
  const headers = [
    'ID',
    'Fecha',
    'Categoría',
    'Descripción',
    'Valor'
  ];

  const escapeCSVValue = (val: any) => {
    if (val === null || val === undefined) return '';
    let stringVal = String(val);
    if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
      stringVal = `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvRows = [
    headers.join(','),
    ...gastos.map(g => [
      escapeCSVValue(g.id),
      escapeCSVValue(g.fecha),
      escapeCSVValue(g.categoria),
      escapeCSVValue(g.descripcion),
      escapeCSVValue(g.valor)
    ].join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `Centinela_Gastos_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates the next sequential Gasto ID.
 */
export function generateNextGastoId(gastos: Gasto[]): string {
  if (gastos.length === 0) {
    return 'GAS-001';
  }

  let maxNum = 0;
  gastos.forEach(g => {
    if (g.id && g.id.startsWith('GAS-')) {
      const numPart = g.id.replace('GAS-', '');
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  return `GAS-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Exports a list of renovaciones to a downloadable Excel-compatible CSV file.
 */
export function exportRenovacionesToCSV(renovaciones: Renovacion[]) {
  const headers = [
    'ID',
    'Cliente',
    'Servicio',
    'Fecha Renovación',
    'Valor',
    'Estado'
  ];

  const escapeCSVValue = (val: any) => {
    if (val === null || val === undefined) return '';
    let stringVal = String(val);
    if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
      stringVal = `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvRows = [
    headers.join(','),
    ...renovaciones.map(r => [
      escapeCSVValue(r.id),
      escapeCSVValue(r.cliente),
      escapeCSVValue(r.servicio),
      escapeCSVValue(r.fechaRenovacion),
      escapeCSVValue(r.valor),
      escapeCSVValue(r.estado)
    ].join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `Centinela_Renovaciones_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates the next sequential Renovacion ID.
 */
export function generateNextRenovacionId(renovaciones: Renovacion[]): string {
  if (renovaciones.length === 0) {
    return 'REN-001';
  }

  let maxNum = 0;
  renovaciones.forEach(r => {
    if (r.id && r.id.startsWith('REN-')) {
      const numPart = r.id.replace('REN-', '');
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  return `REN-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Exports a list of tareas to a downloadable Excel-compatible CSV file.
 */
export function exportTareasToCSV(tareas: Tarea[]) {
  const headers = [
    'ID',
    'Título',
    'Descripción',
    'Prioridad',
    'Fecha',
    'Estado',
    'Fecha Finalización',
    'Hora Finalización'
  ];

  const escapeCSVValue = (val: any) => {
    if (val === null || val === undefined) return '';
    let stringVal = String(val);
    if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
      stringVal = `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvRows = [
    headers.join(','),
    ...tareas.map(t => [
      escapeCSVValue(t.id),
      escapeCSVValue(t.titulo),
      escapeCSVValue(t.descripcion),
      escapeCSVValue(t.prioridad),
      escapeCSVValue(t.fecha),
      escapeCSVValue(t.estado),
      escapeCSVValue(t.fechaFinalizacion),
      escapeCSVValue(t.horaFinalizacion)
    ].join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `Centinela_Tareas_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates the next sequential Tarea ID.
 */
export function generateNextTareaId(tareas: Tarea[]): string {
  if (tareas.length === 0) {
    return 'TAR-001';
  }

  let maxNum = 0;
  tareas.forEach(t => {
    if (t.id && t.id.startsWith('TAR-')) {
      const numPart = t.id.replace('TAR-', '');
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  return `TAR-${String(nextNum).padStart(3, '0')}`;
}




