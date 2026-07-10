import { Tarea } from './types';

// Helper to search for the Tareas spreadsheet
export async function searchTareasSpreadsheet(accessToken: string): Promise<{ id: string; name: string } | null> {
  const query = encodeURIComponent("name = 'Tareas' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error buscando archivo Tareas en Drive: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('Error in searchTareasSpreadsheet:', error);
    throw error;
  }
}

// Helper to create the Tareas spreadsheet
export async function createTareasSpreadsheet(accessToken: string): Promise<{ id: string; name: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: 'Tareas',
    },
    sheets: [
      {
        properties: {
          title: 'Tareas',
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
      throw new Error(`Error creando la hoja Tareas en Sheets: ${res.statusText}`);
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;

    // Initialize headers
    await initializeTareasHeaders(accessToken, spreadsheetId);

    return { id: spreadsheetId, name: 'Tareas' };
  } catch (error) {
    console.error('Error in createTareasSpreadsheet:', error);
    throw error;
  }
}

// Helper to initialize headers in the Tareas spreadsheet
export async function initializeTareasHeaders(accessToken: string, spreadsheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tareas!A1:H1?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Tareas!A1:H1',
    majorDimension: 'ROWS',
    values: [
      [
        'ID',
        'Título',
        'Descripción',
        'Prioridad',
        'Fecha',
        'Estado',
        'Fecha Finalización',
        'Hora Finalización',
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
    throw new Error(`Error inicializando encabezados de Tareas: ${res.statusText}`);
  }
}

// Fetch the sheetId (gid) for a specific tab name in the Tareas spreadsheet
export async function getTareasSheetIdOfTab(accessToken: string, spreadsheetId: string, tabName: string): Promise<number> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error obteniendo metadatos de la hoja Tareas: ${res.statusText}`);
    }
    const data = await res.json();
    const sheet = data.sheets?.find((s: any) => s.properties?.title === tabName);
    if (sheet && sheet.properties && typeof sheet.properties.sheetId === 'number') {
      return sheet.properties.sheetId;
    }
    return 0; // Default fallback to first sheet
  } catch (error) {
    console.error('Error in getTareasSheetIdOfTab:', error);
    return 0;
  }
}

// Fetch and parse all tareas
export async function getTareas(accessToken: string, spreadsheetId: string): Promise<Tarea[]> {
  const range = 'Tareas!A1:H1000';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      if (res.status === 404 || res.status === 400) {
        await initializeTareasHeaders(accessToken, spreadsheetId);
        return [];
      }
      throw new Error(`Error leyendo datos de Tareas: ${res.statusText}`);
    }

    const data = await res.json();
    const rows: string[][] = data.values || [];

    if (rows.length <= 1) {
      return []; // Just header or empty
    }

    const tareas: Tarea[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      tareas.push({
        id: row[0] || '',
        titulo: row[1] || '',
        descripcion: row[2] || '',
        prioridad: row[3] || '',
        fecha: row[4] || '',
        estado: row[5] || '',
        fechaFinalizacion: row[6] || '',
        horaFinalizacion: row[7] || '',
      });
    }

    return tareas;
  } catch (error) {
    console.error('Error in getTareas:', error);
    throw error;
  }
}

// Add a new tarea (append row)
export async function addTarea(accessToken: string, spreadsheetId: string, tarea: Tarea): Promise<void> {
  const range = 'Tareas!A:H';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Tareas!A:H',
    majorDimension: 'ROWS',
    values: [
      [
        tarea.id,
        tarea.titulo,
        tarea.descripcion,
        tarea.prioridad,
        tarea.fecha,
        tarea.estado,
        tarea.fechaFinalizacion,
        tarea.horaFinalizacion,
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
      throw new Error(`Error agregando tarea a la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in addTarea:', error);
    throw error;
  }
}

// Helper to find the row index of a tarea by ID
async function findTareaRowIndexById(accessToken: string, spreadsheetId: string, id: string): Promise<number | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tareas!A1:A1000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Error de Google Sheets al buscar la tarea (${res.status} ${res.statusText}): ${errorText}`);
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  for (let i = 0; i < rows.length; i++) {
    if (rows[i] && rows[i][0]) {
      const cellId = String(rows[i][0]).trim().toLowerCase();
      const targetId = String(id).trim().toLowerCase();
      if (cellId === targetId) {
        return i + 1; // 1-based index
      }
    }
  }
  return null;
}

// Update a tarea
export async function updateTarea(accessToken: string, spreadsheetId: string, tarea: Tarea): Promise<void> {
  try {
    const rowNum = await findTareaRowIndexById(accessToken, spreadsheetId, tarea.id);
    if (!rowNum) {
      throw new Error(`Tarea con ID ${tarea.id} no encontrada en la hoja.`);
    }

    const range = `Tareas!A${rowNum}:H${rowNum}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const body = {
      range,
      majorDimension: 'ROWS',
      values: [
        [
          tarea.id,
          tarea.titulo,
          tarea.descripcion,
          tarea.prioridad,
          tarea.fecha,
          tarea.estado,
          tarea.fechaFinalizacion,
          tarea.horaFinalizacion,
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
      throw new Error(`Error actualizando tarea en la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in updateTarea:', error);
    throw error;
  }
}

// Delete a tarea
export async function deleteTarea(accessToken: string, spreadsheetId: string, id: string): Promise<void> {
  try {
    const rowNum = await findTareaRowIndexById(accessToken, spreadsheetId, id);
    if (!rowNum) {
      throw new Error(`Tarea con ID ${id} no encontrada para eliminar.`);
    }

    const sheetId = await getTareasSheetIdOfTab(accessToken, spreadsheetId, 'Tareas');

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
      throw new Error(`Error eliminando la fila de la tarea: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteTarea:', error);
    throw error;
  }
}
