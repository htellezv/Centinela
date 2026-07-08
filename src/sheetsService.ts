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
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Clientes!A1:K1?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Clientes!A1:K1',
    majorDimension: 'ROWS',
    values: [
      [
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
  const range = 'Clientes!A1:K1000';
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
    const rows: string[][] = data.values || [];

    if (rows.length <= 1) {
      return []; // Just header or empty
    }

    // Map rows (skipping headers)
    const clientes: Cliente[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Skip if the row doesn't even have an ID
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      clientes.push({
        id: row[0] || '',
        empresa: row[1] || '',
        contacto: row[2] || '',
        telefono: row[3] || '',
        correo: row[4] || '',
        servicio: row[5] || '',
        valor: row[6] || '',
        fechaInicio: row[7] || '',
        fechaVencimiento: row[8] || '',
        estado: row[9] || '',
        observaciones: row[10] || '',
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
  const range = 'Clientes!A:K';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Clientes!A:K',
    majorDimension: 'ROWS',
    values: [
      [
        cliente.id,
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

    const range = `Clientes!A${rowNum}:K${rowNum}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const body = {
      range,
      majorDimension: 'ROWS',
      values: [
        [
          cliente.id,
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
