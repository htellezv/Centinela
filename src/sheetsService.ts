import { Cliente } from './types';

// Helper to search for the spreadsheet
export async function searchSpreadsheet(accessToken: string): Promise<{ id: string; name: string } | null> {
  const query = encodeURIComponent("name = 'Clientes' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error buscando archivo en Drive: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('Error in searchSpreadsheet:', error);
    throw error;
  }
}

// Helper to create the spreadsheet
export async function createSpreadsheet(accessToken: string): Promise<{ id: string; name: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: 'Clientes',
    },
    sheets: [
      {
        properties: {
          title: 'Clientes',
        },
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Error creando la hoja en Sheets: ${res.statusText}`);
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;

    // Initialize headers
    await initializeHeaders(accessToken, spreadsheetId);

    return { id: spreadsheetId, name: 'Clientes' };
  } catch (error) {
    console.error('Error in createSpreadsheet:', error);
    throw error;
  }
}

// Helper to initialize headers in the spreadsheet
async function initializeHeaders(accessToken: string, spreadsheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Clientes!A1:N1?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Clientes!A1:N1',
    majorDimension: 'ROWS',
    values: [
      [
        'ID',
        'País',
        'Tipo Identificación',
        'Número Identificación',
        'Empresa',
        'Contacto',
        'Teléfono',
        'Correo',
        'Servicio',
        'Valor',
        'Fecha Inicio',
        'Fecha Vencimiento',
        'Estado',
        'Observaciones',
      ],
    ],
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Error inicializando encabezados: ${res.statusText}`);
  }
}

// Function to safely migrate Clientes spreadsheet by inserting País, Tipo Identificación and Número Identificación columns after ID
async function migrateClientesSheet(accessToken: string, spreadsheetId: string) {
  try {
    const sheetId = await getSheetIdOfTab(accessToken, spreadsheetId, 'Clientes');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const body = {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'COLUMNS',
              startIndex: 1, // Insert columns at B, C, D (indices 1, 2, 3)
              endIndex: 4,
            },
            inheritFromBefore: true,
          },
        },
      ],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Error insertando columnas de migración para Clientes: ${res.statusText}`);
    }

    // Update the newly inserted headers
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Clientes!B1:D1?valueInputOption=USER_ENTERED`;
    const updateBody = {
      range: 'Clientes!B1:D1',
      majorDimension: 'ROWS',
      values: [['País', 'Tipo Identificación', 'Número Identificación']],
    };

    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!updateRes.ok) {
      throw new Error(`Error actualizando encabezados de migración para Clientes: ${updateRes.statusText}`);
    }
  } catch (error) {
    console.error('Error migrating Clientes sheet:', error);
    throw error;
  }
}

// Fetch the sheetId (gid) for a specific tab name
export async function getSheetIdOfTab(accessToken: string, spreadsheetId: string, tabName: string): Promise<number> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error obteniendo metadatos de la hoja: ${res.statusText}`);
    }
    const data = await res.json();
    const sheet = data.sheets?.find((s: any) => s.properties?.title === tabName);
    if (sheet && sheet.properties && typeof sheet.properties.sheetId === 'number') {
      return sheet.properties.sheetId;
    }
    return 0; // Default fallback to first sheet
  } catch (error) {
    console.error('Error in getSheetIdOfTab:', error);
    return 0;
  }
}

// Fetch and parse all clients
export async function getClientes(accessToken: string, spreadsheetId: string): Promise<Cliente[]> {
  const range = 'Clientes!A1:N1000';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      // If range doesn't exist, try initializing it or return empty
      if (res.status === 404 || res.status === 400) {
        await initializeHeaders(accessToken, spreadsheetId);
        return [];
      }
      throw new Error(`Error leyendo datos de Clientes: ${res.statusText}`);
    }

    const data = await res.json();
    let rows: string[][] = data.values || [];

    if (rows.length === 0) {
      await initializeHeaders(accessToken, spreadsheetId);
      return [];
    }

    // Auto-migration check: If the second column is 'Empresa' instead of 'País', run migration
    const headers = rows[0] || [];
    if (headers.length > 0 && headers[1] === 'Empresa') {
      console.log('Detectada estructura antigua de Clientes. Migrando hoja...');
      await migrateClientesSheet(accessToken, spreadsheetId);
      // Re-fetch data after migration
      const reFetchRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (reFetchRes.ok) {
        const reFetchData = await reFetchRes.json();
        rows = reFetchData.values || [];
      } else {
        throw new Error(`Error al volver a consultar datos tras migración de Clientes: ${reFetchRes.statusText}`);
      }
    }

    if (rows.length <= 1) {
      return []; // Just header or empty
    }

    // Get current headers to map columns dynamically and robustly
    const currentHeaders = (rows[0] || []).map(h => String(h || '').trim().toLowerCase());
    const idxId = currentHeaders.indexOf('id');
    const idxPais = currentHeaders.indexOf('país');
    const idxTipoId = currentHeaders.indexOf('tipo identificación');
    const idxNumId = currentHeaders.indexOf('número identificación');
    const idxEmpresa = currentHeaders.indexOf('empresa');
    const idxContacto = currentHeaders.indexOf('contacto');
    const idxTelefono = currentHeaders.indexOf('teléfono');
    const idxCorreo = currentHeaders.indexOf('correo');
    const idxServicio = currentHeaders.indexOf('servicio');
    const idxValor = currentHeaders.indexOf('valor');
    const idxFechaInicio = currentHeaders.indexOf('fecha inicio');
    const idxFechaVenc = currentHeaders.indexOf('fecha vencimiento');
    const idxEstado = currentHeaders.indexOf('estado');
    const idxObs = currentHeaders.indexOf('observaciones');

    // Map rows (skipping headers)
    const clientes: Cliente[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Skip if the row doesn't even have an ID
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      clientes.push({
        id: row[idxId] || '',
        pais: idxPais !== -1 ? row[idxPais] || '' : '',
        tipoIdentificacion: idxTipoId !== -1 ? row[idxTipoId] || '' : '',
        numeroIdentificacion: idxNumId !== -1 ? row[idxNumId] || '' : '',
        empresa: idxEmpresa !== -1 ? row[idxEmpresa] || '' : '',
        contacto: idxContacto !== -1 ? row[idxContacto] || '' : '',
        telefono: idxTelefono !== -1 ? row[idxTelefono] || '' : '',
        correo: idxCorreo !== -1 ? row[idxCorreo] || '' : '',
        servicio: idxServicio !== -1 ? row[idxServicio] || '' : '',
        valor: idxValor !== -1 ? row[idxValor] || '' : '',
        fechaInicio: idxFechaInicio !== -1 ? row[idxFechaInicio] || '' : '',
        fechaVencimiento: idxFechaVenc !== -1 ? row[idxFechaVenc] || '' : '',
        estado: idxEstado !== -1 ? row[idxEstado] || 'Activo' : 'Activo',
        observaciones: idxObs !== -1 ? row[idxObs] || '' : '',
      });
    }

    return clientes;
  } catch (error) {
    console.error('Error in getClientes:', error);
    throw error;
  }
}

// Add a new client (append row)
export async function addCliente(accessToken: string, spreadsheetId: string, cliente: Cliente): Promise<void> {
  const range = 'Clientes!A:N';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Clientes!A:N',
    majorDimension: 'ROWS',
    values: [
      [
        cliente.id,
        cliente.pais || '',
        cliente.tipoIdentificacion || '',
        cliente.numeroIdentificacion || '',
        cliente.empresa,
        cliente.contacto,
        cliente.telefono,
        cliente.correo,
        cliente.servicio,
        cliente.valor,
        cliente.fechaInicio,
        cliente.fechaVencimiento,
        cliente.estado,
        cliente.observaciones,
      ],
    ],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Error agregando cliente a la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in addCliente:', error);
    throw error;
  }
}

// Helper to find the row index of a client by ID (1-based row number)
async function findRowIndexById(accessToken: string, spreadsheetId: string, id: string): Promise<number | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Clientes!A1:A1000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const rows: string[][] = data.values || [];

  for (let i = 0; i < rows.length; i++) {
    if (rows[i] && rows[i][0] === id) {
      return i + 1; // 1-based index
    }
  }
  return null;
}

// Update a client
export async function updateCliente(accessToken: string, spreadsheetId: string, cliente: Cliente): Promise<void> {
  try {
    const rowNum = await findRowIndexById(accessToken, spreadsheetId, cliente.id);
    if (!rowNum) {
      throw new Error(`Cliente con ID ${cliente.id} no encontrado en la hoja.`);
    }

    const range = `Clientes!A${rowNum}:N${rowNum}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const body = {
      range,
      majorDimension: 'ROWS',
      values: [
        [
          cliente.id,
          cliente.pais || '',
          cliente.tipoIdentificacion || '',
          cliente.numeroIdentificacion || '',
          cliente.empresa,
          cliente.contacto,
          cliente.telefono,
          cliente.correo,
          cliente.servicio,
          cliente.valor,
          cliente.fechaInicio,
          cliente.fechaVencimiento,
          cliente.estado,
          cliente.observaciones,
        ],
      ],
    };

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Error actualizando cliente en la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in updateCliente:', error);
    throw error;
  }
}

// Delete a client
export async function deleteCliente(accessToken: string, spreadsheetId: string, id: string): Promise<void> {
  try {
    const rowNum = await findRowIndexById(accessToken, spreadsheetId, id);
    if (!rowNum) {
      throw new Error(`Cliente con ID ${id} no encontrado para eliminar.`);
    }

    // Get sheet gid of "Clientes" tab
    const sheetId = await getSheetIdOfTab(accessToken, spreadsheetId, 'Clientes');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const body = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowNum - 1, // 0-based start (inclusive)
              endIndex: rowNum,       // 0-based end (exclusive)
            },
          },
        },
      ],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Error eliminando la fila del cliente: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteCliente:', error);
    throw error;
  }
}
