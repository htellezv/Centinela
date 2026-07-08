export interface Cliente {
  id: string;
  empresa: string;
  contacto: string;
  telefono: string;
  correo: string;
  servicio: string;
  valor: number | string;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: string;
  observaciones: string;
}

export interface Prospecto {
  id: string;
  empresa: string;
  contacto: string;
  telefono: string;
  correo: string;
  servicioInteres: string;
  valorEstimado: number | string;
  estado: string;
  ultimoContacto: string;
  proximoSeguimiento: string;
  observaciones: string;
}

export interface Venta {
  id: string;
  cliente: string;
  servicio: string;
  valor: number | string;
  fecha: string;
  estadoPago: string;
  fechaInicio: string;
  fechaRenovacion: string;
  observaciones: string;
}

export interface Gasto {
  id: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  valor: number | string;
}

export interface Renovacion {
  id: string;
  cliente: string;
  servicio: string;
  fechaRenovacion: string;
  valor: number | string;
  estado: string;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: string;
  fecha: string;
  estado: string;
  fechaFinalizacion: string;
  horaFinalizacion: string;
}

export interface SheetsConfig {
  spreadsheetId: string;
  spreadsheetName: string;
}

