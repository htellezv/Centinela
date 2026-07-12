import { Prospecto } from './types';

// Helper to search for the Prospectos spreadsheet
export async function searchProspectosSpreadsheet(accessToken: string): Promise<{ id: string; name: string } | null> {
  const query = encodeURIComponent("name = 'Prospectos' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error buscando archivo Prospectos en Drive: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('Error in searchProspectosSpreadsheet:', error);
    throw error;
  }
}

// Helper to create the Prospectos spreadsheet
export async function createProspectosSpreadsheet(accessToken: string): Promise<{ id: string; name: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: 'Prospectos',
    },
    sheets: [
      {
        properties: {
          title: 'Prospectos',
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
      throw new Error(`Error creando la hoja Prospectos en Sheets: ${res.statusText}`);
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;

    // Initialize headers
    await initializeProspectosHeaders(accessToken, spreadsheetId);

    return { id: spreadsheetId, name: 'Prospectos' };
  } catch (error) {
    console.error('Error in createProspectosSpreadsheet:', error);
    throw error;
  }
}

// Helper to initialize headers in the Prospectos spreadsheet
export async function initializeProspectosHeaders(accessToken: string, spreadsheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Prospectos!A1:N1?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Prospectos!A1:N1',
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
        'Servicio de interés',
        'Valor estimado',
        'Estado',
        'Último contacto',
        'Próximo seguimiento',
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
    throw new Error(`Error inicializando encabezados de Prospectos: ${res.statusText}`);
  }
}

// Function to safely migrate Prospectos spreadsheet by inserting País, Tipo Identificación and Número Identificación columns after ID
async function migrateProspectosSheet(accessToken: string, spreadsheetId: string) {
  try {
    const sheetId = await getProspectosSheetIdOfTab(accessToken, spreadsheetId, 'Prospectos');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const body = {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'COLUMNS',
              startIndex: 1, // Insert columns B, C, D (indices 1, 2, 3)
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
      throw new Error(`Error insertando columnas de migración para Prospectos: ${res.statusText}`);
    }

    // Update the newly inserted headers
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Prospectos!B1:D1?valueInputOption=USER_ENTERED`;
    const updateBody = {
      range: 'Prospectos!B1:D1',
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
      throw new Error(`Error actualizando encabezados de migración para Prospectos: ${updateRes.statusText}`);
    }
  } catch (error) {
    console.error('Error migrating Prospectos sheet:', error);
    throw error;
  }
}

// Fetch the sheetId (gid) for a specific tab name in the Prospectos spreadsheet
export async function getProspectosSheetIdOfTab(accessToken: string, spreadsheetId: string, tabName: string): Promise<number> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error obteniendo metadatos de la hoja Prospectos: ${res.statusText}`);
    }
    const data = await res.json();
    const sheet = data.sheets?.find((s: any) => s.properties?.title === tabName);
    if (sheet && sheet.properties && typeof sheet.properties.sheetId === 'number') {
      return sheet.properties.sheetId;
    }
    return 0; // Default fallback to first sheet
  } catch (error) {
    console.error('Error in getProspectosSheetIdOfTab:', error);
    return 0;
  }
}

// Fetch and parse all prospectos
export async function getProspectos(accessToken: string, spreadsheetId: string): Promise<Prospecto[]> {
  const range = 'Prospectos!A1:N1000';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      // If range doesn't exist, try initializing it or return empty
      if (res.status === 404 || res.status === 400) {
        await initializeProspectosHeaders(accessToken, spreadsheetId);
        return [];
      }
      throw new Error(`Error leyendo datos de Prospectos: ${res.statusText}`);
    }

    const data = await res.json();
    let rows: string[][] = data.values || [];

    if (rows.length === 0) {
      await initializeProspectosHeaders(accessToken, spreadsheetId);
      return [];
    }

    // Auto-migration check: If the second column is 'Empresa' instead of 'País', run migration
    const headers = rows[0] || [];
    if (headers.length > 0 && headers[1] === 'Empresa') {
      console.log('Detectada estructura antigua de Prospectos. Migrando hoja...');
      await migrateProspectosSheet(accessToken, spreadsheetId);
      // Re-fetch data after migration
      const reFetchRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (reFetchRes.ok) {
        const reFetchData = await reFetchRes.json();
        rows = reFetchData.values || [];
      } else {
        throw new Error(`Error al volver a consultar datos tras migración de Prospectos: ${reFetchRes.statusText}`);
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
    const idxServicioInteres = currentHeaders.indexOf('servicio de interés');
    const idxValorEstimado = currentHeaders.indexOf('valor estimado');
    const idxEstado = currentHeaders.indexOf('estado');
    const idxUltimoContacto = currentHeaders.indexOf('último contacto');
    const idxProximoSeguimiento = currentHeaders.indexOf('próximo seguimiento');
    const idxObs = currentHeaders.indexOf('observaciones');

    // Map rows (skipping headers)
    const prospectos: Prospecto[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Skip if the row doesn't even have an ID
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      prospectos.push({
        id: row[idxId] || '',
        pais: idxPais !== -1 ? row[idxPais] || '' : '',
        tipoIdentificacion: idxTipoId !== -1 ? row[idxTipoId] || '' : '',
        numeroIdentificacion: idxNumId !== -1 ? row[idxNumId] || '' : '',
        empresa: idxEmpresa !== -1 ? row[idxEmpresa] || '' : '',
        contacto: idxContacto !== -1 ? row[idxContacto] || '' : '',
        telefono: idxTelefono !== -1 ? row[idxTelefono] || '' : '',
        correo: idxCorreo !== -1 ? row[idxCorreo] || '' : '',
        servicioInteres: idxServicioInteres !== -1 ? row[idxServicioInteres] || '' : '',
        valorEstimado: idxValorEstimado !== -1 ? row[idxValorEstimado] || '' : '',
        estado: idxEstado !== -1 ? row[idxEstado] || 'Nuevo' : 'Nuevo',
        ultimoContacto: idxUltimoContacto !== -1 ? row[idxUltimoContacto] || '' : '',
        proximoSeguimiento: idxProximoSeguimiento !== -1 ? row[idxProximoSeguimiento] || '' : '',
        observaciones: idxObs !== -1 ? row[idxObs] || '' : '',
      });
    }

    return prospectos;
  } catch (error) {
    console.error('Error in getProspectos:', error);
    throw error;
  }
}

// Add a new prospecto (append row)
export async function addProspecto(accessToken: string, spreadsheetId: string, prospecto: Prospecto): Promise<void> {
  const range = 'Prospectos!A:N';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const body = {
    range: 'Prospectos!A:N',
    majorDimension: 'ROWS',
    values: [
      [
        prospecto.id,
        prospecto.pais || '',
        prospecto.tipoIdentificacion || '',
        prospecto.numeroIdentificacion || '',
        prospecto.empresa,
        prospecto.contacto,
        prospecto.telefono,
        prospecto.correo,
        prospecto.servicioInteres,
        prospecto.valorEstimado,
        prospecto.estado,
        prospecto.ultimoContacto,
        prospecto.proximoSeguimiento,
        prospecto.observaciones,
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
      throw new Error(`Error agregando prospecto a la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in addProspecto:', error);
    throw error;
  }
}

// Helper to find the row index of a prospecto by ID (1-based row number)
async function findProspectoRowIndexById(accessToken: string, spreadsheetId: string, id: string): Promise<number | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Prospectos!A1:A1000`;
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

// Update a prospecto
export async function updateProspecto(accessToken: string, spreadsheetId: string, prospecto: Prospecto): Promise<void> {
  try {
    const rowNum = await findProspectoRowIndexById(accessToken, spreadsheetId, prospecto.id);
    if (!rowNum) {
      throw new Error(`Prospecto con ID ${prospecto.id} no encontrado en la hoja.`);
    }

    const range = `Prospectos!A${rowNum}:N${rowNum}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const body = {
      range,
      majorDimension: 'ROWS',
      values: [
        [
          prospecto.id,
          prospecto.pais || '',
          prospecto.tipoIdentificacion || '',
          prospecto.numeroIdentificacion || '',
          prospecto.empresa,
          prospecto.contacto,
          prospecto.telefono,
          prospecto.correo,
          prospecto.servicioInteres,
          prospecto.valorEstimado,
          prospecto.estado,
          prospecto.ultimoContacto,
          prospecto.proximoSeguimiento,
          prospecto.observaciones,
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
      throw new Error(`Error actualizando prospecto en la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in updateProspecto:', error);
    throw error;
  }
}

// Delete a prospecto
export async function deleteProspecto(accessToken: string, spreadsheetId: string, id: string): Promise<void> {
  try {
    const rowNum = await findProspectoRowIndexById(accessToken, spreadsheetId, id);
    if (!rowNum) {
      throw new Error(`Prospecto con ID ${id} no encontrado para eliminar.`);
    }

    // Get sheet gid of "Prospectos" tab
    const sheetId = await getProspectosSheetIdOfTab(accessToken, spreadsheetId, 'Prospectos');

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
      throw new Error(`Error eliminando la fila del prospecto: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteProspecto:', error);
    throw error;
  }
}
