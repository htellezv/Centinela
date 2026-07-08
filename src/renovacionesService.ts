import { Renovacion } from './types';

// Helper to search for the Renovaciones spreadsheet
export async function searchRenovacionesSpreadsheet(accessToken: string): Promise<{ id: string; name: string } | null> {
  const query = encodeURIComponent("name = 'Renovaciones' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error buscando archivo Renovaciones en Drive: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('Error in searchRenovacionesSpreadsheet:', error);
    throw error;
  }
}

// Helper to create the Renovaciones spreadsheet
export async function createRenovacionesSpreadsheet(accessToken: string): Promise<{ id: string; name: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: 'Renovaciones',
    },
    sheets: [
      {
        properties: {
          title: 'Renovaciones',
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
      throw new Error(`Error creando la hoja Renovaciones en Sheets: ${res.statusText}`);
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;

    // Initialize headers
    await initializeRenovacionesHeaders(accessToken, spreadsheetId);

    return { id: spreadsheetId, name: 'Renovaciones' };
  } catch (error) {
    console.error('Error in createRenovacionesSpreadsheet:', error);
    throw error;
  }
}

// Helper to initialize headers in the Renovaciones spreadsheet
export async function initializeRenovacionesHeaders(accessToken: string, spreadsheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Renovaciones!A1:F1?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Renovaciones!A1:F1',
    majorDimension: 'ROWS',
    values: [
      [
        'ID',
        'Cliente',
        'Servicio',
        'Fecha Renovación',
        'Valor',
        'Estado',
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
    throw new Error(`Error inicializando encabezados de Renovaciones: ${res.statusText}`);
  }
}

// Fetch the sheetId (gid) for a specific tab name in the Renovaciones spreadsheet
export async function getRenovacionesSheetIdOfTab(accessToken: string, spreadsheetId: string, tabName: string): Promise<number> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error obteniendo metadatos de la hoja Renovaciones: ${res.statusText}`);
    }
    const data = await res.json();
    const sheet = data.sheets?.find((s: any) => s.properties?.title === tabName);
    if (sheet && sheet.properties && typeof sheet.properties.sheetId === 'number') {
      return sheet.properties.sheetId;
    }
    return 0; // Default fallback to first sheet
  } catch (error) {
    console.error('Error in getRenovacionesSheetIdOfTab:', error);
    return 0;
  }
}

// Fetch and parse all renovaciones
export async function getRenovaciones(accessToken: string, spreadsheetId: string): Promise<Renovacion[]> {
  const range = 'Renovaciones!A1:F1000';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      if (res.status === 404 || res.status === 400) {
        await initializeRenovacionesHeaders(accessToken, spreadsheetId);
        return [];
      }
      throw new Error(`Error leyendo datos de Renovaciones: ${res.statusText}`);
    }

    const data = await res.json();
    const rows: string[][] = data.values || [];

    if (rows.length <= 1) {
      return []; // Just header or empty
    }

    const renovaciones: Renovacion[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      renovaciones.push({
        id: row[0] || '',
        cliente: row[1] || '',
        servicio: row[2] || '',
        fechaRenovacion: row[3] || '',
        valor: row[4] || '',
        estado: row[5] || '',
      });
    }

    return renovaciones;
  } catch (error) {
    console.error('Error in getRenovaciones:', error);
    throw error;
  }
}

// Add a new renovacion (append row)
export async function addRenovacion(accessToken: string, spreadsheetId: string, renovacion: Renovacion): Promise<void> {
  const range = 'Renovaciones!A:F';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Renovaciones!A:F',
    majorDimension: 'ROWS',
    values: [
      [
        renovacion.id,
        renovacion.cliente,
        renovacion.servicio,
        renovacion.fechaRenovacion,
        renovacion.valor,
        renovacion.estado,
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
      throw new Error(`Error agregando renovación a la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in addRenovacion:', error);
    throw error;
  }
}

// Helper to find the row index of a renovacion by ID
async function findRenovacionRowIndexById(accessToken: string, spreadsheetId: string, id: string): Promise<number | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Renovaciones!A1:A1000`;
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

// Update a renovacion
export async function updateRenovacion(accessToken: string, spreadsheetId: string, renovacion: Renovacion): Promise<void> {
  try {
    const rowNum = await findRenovacionRowIndexById(accessToken, spreadsheetId, renovacion.id);
    if (!rowNum) {
      throw new Error(`Renovación con ID ${renovacion.id} no encontrada en la hoja.`);
    }

    const range = `Renovaciones!A${rowNum}:F${rowNum}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const body = {
      range,
      majorDimension: 'ROWS',
      values: [
        [
          renovacion.id,
          renovacion.cliente,
          renovacion.servicio,
          renovacion.fechaRenovacion,
          renovacion.valor,
          renovacion.estado,
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
      throw new Error(`Error actualizando renovación en la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in updateRenovacion:', error);
    throw error;
  }
}

// Delete a renovacion
export async function deleteRenovacion(accessToken: string, spreadsheetId: string, id: string): Promise<void> {
  try {
    const rowNum = await findRenovacionRowIndexById(accessToken, spreadsheetId, id);
    if (!rowNum) {
      throw new Error(`Renovación con ID ${id} no encontrada para eliminar.`);
    }

    const sheetId = await getRenovacionesSheetIdOfTab(accessToken, spreadsheetId, 'Renovaciones');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const body = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowNum - 1,
              endIndex: rowNum,
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
      throw new Error(`Error eliminando la fila de la renovación: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteRenovacion:', error);
    throw error;
  }
}
