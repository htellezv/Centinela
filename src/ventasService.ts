import { Venta } from './types';

// Helper to search for the Ventas spreadsheet
export async function searchVentasSpreadsheet(accessToken: string): Promise<{ id: string; name: string } | null> {
  const query = encodeURIComponent("name = 'Ventas' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error buscando archivo Ventas en Drive: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('Error in searchVentasSpreadsheet:', error);
    throw error;
  }
}

// Helper to create the Ventas spreadsheet
export async function createVentasSpreadsheet(accessToken: string): Promise<{ id: string; name: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: 'Ventas',
    },
    sheets: [
      {
        properties: {
          title: 'Ventas',
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
      throw new Error(`Error creando la hoja Ventas en Sheets: ${res.statusText}`);
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;

    // Initialize headers
    await initializeVentasHeaders(accessToken, spreadsheetId);

    return { id: spreadsheetId, name: 'Ventas' };
  } catch (error) {
    console.error('Error in createVentasSpreadsheet:', error);
    throw error;
  }
}

// Helper to initialize headers in the Ventas spreadsheet
export async function initializeVentasHeaders(accessToken: string, spreadsheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Ventas!A1:I1?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Ventas!A1:I1',
    majorDimension: 'ROWS',
    values: [
      [
        'ID',
        'Cliente',
        'Servicio',
        'Valor',
        'Fecha',
        'Estado de pago',
        'Fecha Inicio',
        'Fecha Renovación',
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
    throw new Error(`Error inicializando encabezados de Ventas: ${res.statusText}`);
  }
}

// Fetch the sheetId (gid) for a specific tab name in the Ventas spreadsheet
export async function getVentasSheetIdOfTab(accessToken: string, spreadsheetId: string, tabName: string): Promise<number> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error obteniendo metadatos de la hoja Ventas: ${res.statusText}`);
    }
    const data = await res.json();
    const sheet = data.sheets?.find((s: any) => s.properties?.title === tabName);
    if (sheet && sheet.properties && typeof sheet.properties.sheetId === 'number') {
      return sheet.properties.sheetId;
    }
    return 0; // Default fallback to first sheet
  } catch (error) {
    console.error('Error in getVentasSheetIdOfTab:', error);
    return 0;
  }
}

// Fetch and parse all ventas
export async function getVentas(accessToken: string, spreadsheetId: string): Promise<Venta[]> {
  const range = 'Ventas!A1:I1000';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      // If range doesn't exist, try initializing it or return empty
      if (res.status === 404 || res.status === 400) {
        await initializeVentasHeaders(accessToken, spreadsheetId);
        return [];
      }
      throw new Error(`Error leyendo datos de Ventas: ${res.statusText}`);
    }

    const data = await res.json();
    const rows: string[][] = data.values || [];

    if (rows.length <= 1) {
      return []; // Just header or empty
    }

    // Map rows (skipping headers)
    const ventas: Venta[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Skip if the row doesn't even have an ID
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      ventas.push({
        id: row[0] || '',
        cliente: row[1] || '',
        servicio: row[2] || '',
        valor: row[3] || '',
        fecha: row[4] || '',
        estadoPago: row[5] || '',
        fechaInicio: row[6] || '',
        fechaRenovacion: row[7] || '',
        observaciones: row[8] || '',
      });
    }

    return ventas;
  } catch (error) {
    console.error('Error in getVentas:', error);
    throw error;
  }
}

// Add a new venta (append row)
export async function addVenta(accessToken: string, spreadsheetId: string, venta: Venta): Promise<void> {
  const range = 'Ventas!A:I';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Ventas!A:I',
    majorDimension: 'ROWS',
    values: [
      [
        venta.id,
        venta.cliente,
        venta.servicio,
        venta.valor,
        venta.fecha,
        venta.estadoPago,
        venta.fechaInicio,
        venta.fechaRenovacion,
        venta.observaciones,
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
      throw new Error(`Error agregando venta a la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in addVenta:', error);
    throw error;
  }
}

// Helper to find the row index of a venta by ID (1-based row number)
async function findVentaRowIndexById(accessToken: string, spreadsheetId: string, id: string): Promise<number | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Ventas!A1:A1000`;
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

// Update a venta
export async function updateVenta(accessToken: string, spreadsheetId: string, venta: Venta): Promise<void> {
  try {
    const rowNum = await findVentaRowIndexById(accessToken, spreadsheetId, venta.id);
    if (!rowNum) {
      throw new Error(`Venta con ID ${venta.id} no encontrada en la hoja.`);
    }

    const range = `Ventas!A${rowNum}:I${rowNum}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const body = {
      range,
      majorDimension: 'ROWS',
      values: [
        [
          venta.id,
          venta.cliente,
          venta.servicio,
          venta.valor,
          venta.fecha,
          venta.estadoPago,
          venta.fechaInicio,
          venta.fechaRenovacion,
          venta.observaciones,
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
      throw new Error(`Error actualizando venta en la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in updateVenta:', error);
    throw error;
  }
}

// Delete a venta
export async function deleteVenta(accessToken: string, spreadsheetId: string, id: string): Promise<void> {
  try {
    const rowNum = await findVentaRowIndexById(accessToken, spreadsheetId, id);
    if (!rowNum) {
      throw new Error(`Venta con ID ${id} no encontrada para eliminar.`);
    }

    // Get sheet gid of "Ventas" tab
    const sheetId = await getVentasSheetIdOfTab(accessToken, spreadsheetId, 'Ventas');

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
      throw new Error(`Error eliminando la fila de la venta: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteVenta:', error);
    throw error;
  }
}
