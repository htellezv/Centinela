import { Gasto } from './types';

// Helper to search for the Gastos spreadsheet
export async function searchGastosSpreadsheet(accessToken: string): Promise<{ id: string; name: string } | null> {
  const query = encodeURIComponent("name = 'Gastos' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error buscando archivo Gastos en Drive: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('Error in searchGastosSpreadsheet:', error);
    throw error;
  }
}

// Helper to create the Gastos spreadsheet
export async function createGastosSpreadsheet(accessToken: string): Promise<{ id: string; name: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: 'Gastos',
    },
    sheets: [
      {
        properties: {
          title: 'Gastos',
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
      throw new Error(`Error creando la hoja Gastos en Sheets: ${res.statusText}`);
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;

    // Initialize headers
    await initializeGastosHeaders(accessToken, spreadsheetId);

    return { id: spreadsheetId, name: 'Gastos' };
  } catch (error) {
    console.error('Error in createGastosSpreadsheet:', error);
    throw error;
  }
}

// Helper to initialize headers in the Gastos spreadsheet
export async function initializeGastosHeaders(accessToken: string, spreadsheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Gastos!A1:E1?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Gastos!A1:E1',
    majorDimension: 'ROWS',
    values: [
      [
        'ID',
        'Fecha',
        'Categoría',
        'Descripción',
        'Valor',
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
    throw new Error(`Error inicializando encabezados de Gastos: ${res.statusText}`);
  }
}

// Fetch the sheetId (gid) for a specific tab name in the Gastos spreadsheet
export async function getGastosSheetIdOfTab(accessToken: string, spreadsheetId: string, tabName: string): Promise<number> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error obteniendo metadatos de la hoja Gastos: ${res.statusText}`);
    }
    const data = await res.json();
    const sheet = data.sheets?.find((s: any) => s.properties?.title === tabName);
    if (sheet && sheet.properties && typeof sheet.properties.sheetId === 'number') {
      return sheet.properties.sheetId;
    }
    return 0; // Default fallback to first sheet
  } catch (error) {
    console.error('Error in getGastosSheetIdOfTab:', error);
    return 0;
  }
}

// Fetch and parse all gastos
export async function getGastos(accessToken: string, spreadsheetId: string): Promise<Gasto[]> {
  const range = 'Gastos!A1:E1000';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      // If range doesn't exist, try initializing it or return empty
      if (res.status === 404 || res.status === 400) {
        await initializeGastosHeaders(accessToken, spreadsheetId);
        return [];
      }
      throw new Error(`Error leyendo datos de Gastos: ${res.statusText}`);
    }

    const data = await res.json();
    const rows: string[][] = data.values || [];

    if (rows.length <= 1) {
      return []; // Just header or empty
    }

    // Map rows (skipping headers)
    const gastos: Gasto[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Skip if the row doesn't even have an ID
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      gastos.push({
        id: row[0] || '',
        fecha: row[1] || '',
        categoria: row[2] || '',
        descripcion: row[3] || '',
        valor: row[4] || '',
      });
    }

    return gastos;
  } catch (error) {
    console.error('Error in getGastos:', error);
    throw error;
  }
}

// Add a new gasto (append row)
export async function addGasto(accessToken: string, spreadsheetId: string, gasto: Gasto): Promise<void> {
  const range = 'Gastos!A:E';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Gastos!A:E',
    majorDimension: 'ROWS',
    values: [
      [
        gasto.id,
        gasto.fecha,
        gasto.categoria,
        gasto.descripcion,
        gasto.valor,
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
      throw new Error(`Error agregando gasto a la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in addGasto:', error);
    throw error;
  }
}

// Helper to find the row index of a gasto by ID (1-based row number)
async function findGastoRowIndexById(accessToken: string, spreadsheetId: string, id: string): Promise<number | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Gastos!A1:A1000`;
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

// Update a gasto
export async function updateGasto(accessToken: string, spreadsheetId: string, gasto: Gasto): Promise<void> {
  try {
    const rowNum = await findGastoRowIndexById(accessToken, spreadsheetId, gasto.id);
    if (!rowNum) {
      throw new Error(`Gasto con ID ${gasto.id} no encontrado en la hoja.`);
    }

    const range = `Gastos!A${rowNum}:E${rowNum}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const body = {
      range,
      majorDimension: 'ROWS',
      values: [
        [
          gasto.id,
          gasto.fecha,
          gasto.categoria,
          gasto.descripcion,
          gasto.valor,
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
      throw new Error(`Error actualizando gasto en la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in updateGasto:', error);
    throw error;
  }
}

// Delete a gasto
export async function deleteGasto(accessToken: string, spreadsheetId: string, id: string): Promise<void> {
  try {
    const rowNum = await findGastoRowIndexById(accessToken, spreadsheetId, id);
    if (!rowNum) {
      throw new Error(`Gasto con ID ${id} no encontrado para eliminar.`);
    }

    // Get sheet gid of "Gastos" tab
    const sheetId = await getGastosSheetIdOfTab(accessToken, spreadsheetId, 'Gastos');

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
      throw new Error(`Error eliminando la fila del gasto: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteGasto:', error);
    throw error;
  }
}
