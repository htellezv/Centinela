import { LeadExtraido } from './types';

// Helper to search for the Extracción Centinela spreadsheet
export async function searchExtraccionSpreadsheet(accessToken: string): Promise<{ id: string; name: string } | null> {
  const query = encodeURIComponent("name = 'Extracción Centinela' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Error buscando archivo Extracción Centinela en Drive: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('Error in searchExtraccionSpreadsheet:', error);
    throw error;
  }
}

// Helper to create the Extracción Centinela spreadsheet
export async function createExtraccionSpreadsheet(accessToken: string): Promise<{ id: string; name: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: 'Extracción Centinela',
    },
    sheets: [
      {
        properties: {
          title: 'Leads Extraidos',
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
      throw new Error(`Error creando la hoja Extracción Centinela en Sheets: ${res.statusText}`);
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;

    // Initialize headers
    await initializeExtraccionHeaders(accessToken, spreadsheetId);

    return { id: spreadsheetId, name: 'Extracción Centinela' };
  } catch (error) {
    console.error('Error in createExtraccionSpreadsheet:', error);
    throw error;
  }
}

// Helper to initialize headers in the Extracción Centinela spreadsheet
export async function initializeExtraccionHeaders(accessToken: string, spreadsheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Leads Extraidos'!A1:H1?valueInputOption=USER_ENTERED`;
  const body = {
    range: "'Leads Extraidos'!A1:H1",
    majorDimension: 'ROWS',
    values: [
      [
        'ID',
        'Empresa',
        'Contacto',
        'Teléfono',
        'Correo',
        'País',
        'Fecha Importación',
        'Categoría',
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
    throw new Error(`Error inicializando encabezados de Leads Extraídos: ${res.statusText}`);
  }
}

// Fetch the sheetId (gid) for a specific tab name in the Extracción Centinela spreadsheet
export async function getExtraccionSheetIdOfTab(accessToken: string, spreadsheetId: string, tabName: string): Promise<number> {
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
    console.error('Error in getExtraccionSheetIdOfTab:', error);
    return 0;
  }
}

// Fetch and parse all leads extraidos
export async function getExtraccionLeads(accessToken: string, spreadsheetId: string): Promise<LeadExtraido[]> {
  const range = "'Leads Extraidos'!A1:H2000";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      if (res.status === 404 || res.status === 400) {
        await initializeExtraccionHeaders(accessToken, spreadsheetId);
        return [];
      }
      throw new Error(`Error leyendo datos de Leads Extraídos: ${res.statusText}`);
    }

    const data = await res.json();
    const rows: string[][] = data.values || [];

    if (rows.length <= 1) {
      return []; // Just headers or empty
    }

    const currentHeaders = (rows[0] || []).map(h => String(h || '').trim().toLowerCase());
    const idxId = currentHeaders.indexOf('id');
    const idxEmpresa = currentHeaders.indexOf('empresa');
    const idxContacto = currentHeaders.indexOf('contacto');
    const idxTelefono = currentHeaders.indexOf('teléfono');
    const idxCorreo = currentHeaders.indexOf('correo');
    const idxPais = currentHeaders.indexOf('país');
    const idxFechaImportacion = currentHeaders.indexOf('fecha importación');
    const idxCategoria = currentHeaders.indexOf('categoría');

    const leads: LeadExtraido[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      leads.push({
        id: row[idxId] || '',
        empresa: idxEmpresa !== -1 ? row[idxEmpresa] || '' : '',
        contacto: idxContacto !== -1 ? row[idxContacto] || '' : '',
        telefono: idxTelefono !== -1 ? row[idxTelefono] || '' : '',
        correo: idxCorreo !== -1 ? row[idxCorreo] || '' : '',
        pais: idxPais !== -1 ? row[idxPais] || '' : '',
        fechaImportacion: idxFechaImportacion !== -1 ? row[idxFechaImportacion] || '' : '',
        categoria: idxCategoria !== -1 ? row[idxCategoria] || '' : '',
      });
    }

    return leads;
  } catch (error) {
    console.error('Error in getExtraccionLeads:', error);
    throw error;
  }
}

// Add a new lead (append row)
export async function addExtraccionLead(accessToken: string, spreadsheetId: string, lead: LeadExtraido): Promise<void> {
  const range = "'Leads Extraidos'!A:H";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const body = {
    range: "'Leads Extraidos'!A:H",
    majorDimension: 'ROWS',
    values: [
      [
        lead.id,
        lead.empresa,
        lead.contacto || '',
        lead.telefono,
        lead.correo || '',
        lead.pais || '',
        lead.fechaImportacion || '',
        lead.categoria || '',
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
      throw new Error(`Error agregando lead extraído a la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in addExtraccionLead:', error);
    throw error;
  }
}

// Batch append leads (multiple rows)
export async function addExtraccionLeadsBatch(accessToken: string, spreadsheetId: string, leads: LeadExtraido[]): Promise<void> {
  if (leads.length === 0) return;
  const range = "'Leads Extraidos'!A:H";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const body = {
    range: "'Leads Extraidos'!A:H",
    majorDimension: 'ROWS',
    values: leads.map(lead => [
      lead.id,
      lead.empresa,
      lead.contacto || '',
      lead.telefono,
      lead.correo || '',
      lead.pais || '',
      lead.fechaImportacion || '',
      lead.categoria || '',
    ]),
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
      throw new Error(`Error agregando lote de leads extraídos a la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in addExtraccionLeadsBatch:', error);
    throw error;
  }
}

// Helper to find the row index of a lead by ID (1-based row number)
async function findRowIndexById(accessToken: string, spreadsheetId: string, id: string): Promise<number | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Leads Extraidos'!A1:A2000`;
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

// Update a lead extraido
export async function updateExtraccionLead(accessToken: string, spreadsheetId: string, lead: LeadExtraido): Promise<void> {
  try {
    const rowNum = await findRowIndexById(accessToken, spreadsheetId, lead.id);
    if (!rowNum) {
      throw new Error(`Lead extraído con ID ${lead.id} no encontrado en la hoja.`);
    }

    const range = `'Leads Extraidos'!A${rowNum}:H${rowNum}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const body = {
      range,
      majorDimension: 'ROWS',
      values: [
        [
          lead.id,
          lead.empresa,
          lead.contacto || '',
          lead.telefono,
          lead.correo || '',
          lead.pais || '',
          lead.fechaImportacion || '',
          lead.categoria || '',
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
      throw new Error(`Error actualizando lead extraído en la hoja: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in updateExtraccionLead:', error);
    throw error;
  }
}

// Delete a lead extraido
export async function deleteExtraccionLead(accessToken: string, spreadsheetId: string, id: string): Promise<void> {
  try {
    const rowNum = await findRowIndexById(accessToken, spreadsheetId, id);
    if (!rowNum) {
      throw new Error(`Lead extraído con ID ${id} no encontrado para eliminar.`);
    }

    // Get sheet gid of "Leads Extraidos" tab
    const sheetId = await getExtraccionSheetIdOfTab(accessToken, spreadsheetId, 'Leads Extraidos');

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
      throw new Error(`Error eliminando la fila del lead extraído: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteExtraccionLead:', error);
    throw error;
  }
}
