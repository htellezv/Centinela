import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(process.cwd(), "data", "db.json");

// Helper to ensure database file exists
function ensureDbExists() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
      dbPath,
      JSON.stringify(
        {
          clientes: [],
          prospectos: [],
          tareas: [],
          ventas: [],
          gastos: [],
          renovaciones: []
        },
        null,
        2
      ),
      "utf-8"
    );
  }
}

// Read database
function readDb() {
  ensureDbExists();
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading db:", error);
    return {
      clientes: [],
      prospectos: [],
      tareas: [],
      ventas: [],
      gastos: [],
      renovaciones: []
    };
  }
}

// Write database
function writeDb(data: any) {
  ensureDbExists();
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing db:", error);
  }
}

// Generate unique ID
function generateId(prefix = "n8n") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

// Middleware to parse JSON payloads
app.use(express.json({ limit: "50mb" }));

// CORS headers for API calls
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-API-Key, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Get API Key from env, or default to a secure fallback
const API_KEY = process.env.N8N_API_KEY || "centinela_secret_api_key_2026";

console.log("--------------------------------------------------");
console.log(`Centinela API initialized!`);
console.log(`Endpoint: http://localhost:3000/api`);
console.log(`API Key in use: ${API_KEY}`);
console.log("--------------------------------------------------");

// Security middleware for API routes
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const providedKey = 
    req.headers["x-api-key"] || 
    req.query["api_key"] || 
    (req.headers["authorization"] && req.headers["authorization"].toString().replace("Bearer ", ""));

  if (!providedKey || providedKey !== API_KEY) {
    return res.status(401).json({
      success: false,
      error: "No autorizado. Token API incorrecto o ausente en el header (X-API-Key o Authorization Bearer)."
    });
  }
  next();
};

// API Documentation / Health Status
app.get("/api/info", (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    message: "Bienvenido a la API de Centinela",
    version: "1.0.0",
    authType: "X-API-Key Header o Authorization Bearer",
    databaseStats: {
      clientes: db.clientes?.length || 0,
      prospectos: db.prospectos?.length || 0,
      tareas: db.tareas?.length || 0,
      ventas: db.ventas?.length || 0,
      gastos: db.gastos?.length || 0,
      renovaciones: db.renovaciones?.length || 0
    },
    endpoints: {
      info: "GET /api/info (Este endpoint)",
      clientes: {
        get: "GET /api/clientes",
        post: "POST /api/clientes (Para crear/actualizar)"
      },
      prospectos: {
        get: "GET /api/prospectos",
        post: "POST /api/prospectos (Para crear/actualizar)"
      },
      tareas: {
        get: "GET /api/tareas",
        post: "POST /api/tareas (Para crear/actualizar)"
      },
      ventas: {
        get: "GET /api/ventas",
        post: "POST /api/ventas"
      },
      sync: {
        post: "POST /api/sync (Sincronización total bidireccional)"
      }
    }
  });
});

// Apply API validation to all rest endpoints
app.use("/api/clientes", validateApiKey);
app.use("/api/prospectos", validateApiKey);
app.use("/api/tareas", validateApiKey);
app.use("/api/ventas", validateApiKey);
app.use("/api/gastos", validateApiKey);
app.use("/api/renovaciones", validateApiKey);
app.use("/api/sync", validateApiKey);

// API Endpoints - CLIENTES
app.get("/api/clientes", (req, res) => {
  const db = readDb();
  res.json({ success: true, count: db.clientes.length, data: db.clientes });
});

app.post("/api/clientes", (req, res) => {
  const db = readDb();
  const item = req.body;
  
  if (!item.id) {
    item.id = generateId("cl");
    item.isNewFromApi = true; // Flag to let client know it needs sync to Google Sheets
  } else {
    // If updating, flag it
    item.isUpdatedFromApi = true;
  }
  
  const index = db.clientes.findIndex((c: any) => c.id === item.id);
  if (index !== -1) {
    db.clientes[index] = { ...db.clientes[index], ...item };
  } else {
    db.clientes.push(item);
  }
  
  writeDb(db);
  res.json({ success: true, message: "Cliente guardado", data: item });
});

app.delete("/api/clientes/:id", (req, res) => {
  const db = readDb();
  const id = req.params.id;
  
  const index = db.clientes.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    db.clientes.splice(index, 1);
    writeDb(db);
    return res.json({ success: true, message: "Cliente eliminado" });
  }
  res.status(404).json({ success: false, error: "Cliente no encontrado" });
});

// API Endpoints - PROSPECTOS
app.get("/api/prospectos", (req, res) => {
  const db = readDb();
  res.json({ success: true, count: db.prospectos.length, data: db.prospectos });
});

app.post("/api/prospectos", (req, res) => {
  const db = readDb();
  const item = req.body;
  
  if (!item.id) {
    item.id = generateId("pr");
    item.isNewFromApi = true;
  } else {
    item.isUpdatedFromApi = true;
  }
  
  const index = db.prospectos.findIndex((p: any) => p.id === item.id);
  if (index !== -1) {
    db.prospectos[index] = { ...db.prospectos[index], ...item };
  } else {
    db.prospectos.push(item);
  }
  
  writeDb(db);
  res.json({ success: true, message: "Prospecto guardado", data: item });
});

app.delete("/api/prospectos/:id", (req, res) => {
  const db = readDb();
  const id = req.params.id;
  const index = db.prospectos.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    db.prospectos.splice(index, 1);
    writeDb(db);
    return res.json({ success: true, message: "Prospecto eliminado" });
  }
  res.status(404).json({ success: false, error: "Prospecto no encontrado" });
});

// API Endpoints - TAREAS
app.get("/api/tareas", (req, res) => {
  const db = readDb();
  res.json({ success: true, count: db.tareas.length, data: db.tareas });
});

app.post("/api/tareas", (req, res) => {
  const db = readDb();
  const item = req.body;
  
  if (!item.id) {
    item.id = generateId("tr");
    item.isNewFromApi = true;
  } else {
    item.isUpdatedFromApi = true;
  }
  
  const index = db.tareas.findIndex((t: any) => t.id === item.id);
  if (index !== -1) {
    db.tareas[index] = { ...db.tareas[index], ...item };
  } else {
    db.tareas.push(item);
  }
  
  writeDb(db);
  res.json({ success: true, message: "Tarea guardada", data: item });
});

app.delete("/api/tareas/:id", (req, res) => {
  const db = readDb();
  const id = req.params.id;
  const index = db.tareas.findIndex((t: any) => t.id === id);
  if (index !== -1) {
    db.tareas.splice(index, 1);
    writeDb(db);
    return res.json({ success: true, message: "Tarea eliminada" });
  }
  res.status(404).json({ success: false, error: "Tarea no encontrada" });
});

// API Endpoints - VENTAS
app.get("/api/ventas", (req, res) => {
  const db = readDb();
  res.json({ success: true, count: db.ventas.length, data: db.ventas });
});

app.post("/api/ventas", (req, res) => {
  const db = readDb();
  const item = req.body;
  
  if (!item.id) {
    item.id = generateId("vt");
    item.isNewFromApi = true;
  } else {
    item.isUpdatedFromApi = true;
  }
  
  const index = db.ventas.findIndex((v: any) => v.id === item.id);
  if (index !== -1) {
    db.ventas[index] = { ...db.ventas[index], ...item };
  } else {
    db.ventas.push(item);
  }
  
  writeDb(db);
  res.json({ success: true, message: "Venta guardada", data: item });
});

app.delete("/api/ventas/:id", (req, res) => {
  const db = readDb();
  const id = req.params.id;
  const index = db.ventas.findIndex((v: any) => v.id === id);
  if (index !== -1) {
    db.ventas.splice(index, 1);
    writeDb(db);
    return res.json({ success: true, message: "Venta eliminada" });
  }
  res.status(404).json({ success: false, error: "Venta no encontrada" });
});

// API Endpoints - GASTOS
app.get("/api/gastos", (req, res) => {
  const db = readDb();
  res.json({ success: true, count: db.gastos.length, data: db.gastos });
});

app.post("/api/gastos", (req, res) => {
  const db = readDb();
  const item = req.body;
  if (!item.id) {
    item.id = generateId("gs");
    item.isNewFromApi = true;
  } else {
    item.isUpdatedFromApi = true;
  }
  const index = db.gastos.findIndex((g: any) => g.id === item.id);
  if (index !== -1) {
    db.gastos[index] = { ...db.gastos[index], ...item };
  } else {
    db.gastos.push(item);
  }
  writeDb(db);
  res.json({ success: true, message: "Gasto guardado", data: item });
});

// API Endpoints - RENOVACIONES
app.get("/api/renovaciones", (req, res) => {
  const db = readDb();
  res.json({ success: true, count: db.renovaciones.length, data: db.renovaciones });
});

app.post("/api/renovaciones", (req, res) => {
  const db = readDb();
  const item = req.body;
  if (!item.id) {
    item.id = generateId("rn");
    item.isNewFromApi = true;
  } else {
    item.isUpdatedFromApi = true;
  }
  const index = db.renovaciones.findIndex((r: any) => r.id === item.id);
  if (index !== -1) {
    db.renovaciones[index] = { ...db.renovaciones[index], ...item };
  } else {
    db.renovaciones.push(item);
  }
  writeDb(db);
  res.json({ success: true, message: "Renovación guardada", data: item });
});

// API Endpoints - ACCIONES AUTOMATIZADAS (Integración n8n)
app.post("/api/acciones/correo", validateApiKey, (req, res) => {
  const { destinatario, asunto, cuerpo, clienteNombre } = req.body;
  if (!destinatario || !asunto || !cuerpo) {
    return res.status(400).json({ success: false, error: "Campos requeridos faltantes (destinatario, asunto, cuerpo)" });
  }
  res.json({
    success: true,
    message: "Acción de correo procesada con éxito",
    data: {
      id: "act_" + Math.random().toString(36).substring(2, 9),
      tipo: "correo",
      destinatario,
      asunto,
      cuerpo,
      clienteNombre,
      fechaProcesado: new Date().toISOString()
    }
  });
});

app.post("/api/acciones/reunion", validateApiKey, (req, res) => {
  const { destinatario, clienteNombre, titulo, fechaHora, linkVideo } = req.body;
  if (!destinatario || !titulo || !fechaHora) {
    return res.status(400).json({ success: false, error: "Campos requeridos faltantes (destinatario, titulo, fechaHora)" });
  }
  res.json({
    success: true,
    message: "Acción de reunión programada con éxito",
    data: {
      id: "act_" + Math.random().toString(36).substring(2, 9),
      tipo: "reunion",
      destinatario,
      clienteNombre,
      titulo,
      fechaHora,
      linkVideo: linkVideo || "https://meet.google.com/abc-defg-hij",
      fechaProcesado: new Date().toISOString()
    }
  });
});

// Proxy to forward webhook requests to n8n to completely bypass browser CORS limitations
app.post("/api/acciones/n8n-proxy", async (req, res) => {
  const { targetUrl, payload } = req.body;
  if (!targetUrl) {
    return res.status(400).json({ success: false, error: "targetUrl es requerido para realizar el reenvío" });
  }

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    let data;
    const responseText = await response.text();
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    res.status(status).json({
      success: response.ok,
      status,
      data
    });
  } catch (err: any) {
    console.error("Error proxying to n8n webhook:", err);
    res.status(500).json({
      success: false,
      error: `Error de red al conectar con n8n: ${err.message}`
    });
  }
});

// API Endpoints - SYNCHRONIZATION
// This endpoint receives the full lists from the client and merges them.
// Client state takes priority unless an item on the server has "isNewFromApi" or "isUpdatedFromApi".
app.post("/api/sync", (req, res) => {
  const db = readDb();
  const clientData = req.body;
  
  const mergeLists = (serverList: any[], clientList: any[] = []) => {
    const merged = [...serverList];
    
    // Add client items or update existing ones
    clientList.forEach((cItem: any) => {
      const idx = merged.findIndex((sItem: any) => sItem.id === cItem.id);
      if (idx !== -1) {
        // If the server has a newer modification from API that isn't synced yet, do not overwrite it.
        if (merged[idx].isNewFromApi || merged[idx].isUpdatedFromApi) {
          // Keep server version
        } else {
          // Update with client version
          merged[idx] = cItem;
        }
      } else {
        // Not in server, add it
        merged.push(cItem);
      }
    });

    return merged;
  };

  db.clientes = mergeLists(db.clientes, clientData.clientes);
  db.prospectos = mergeLists(db.prospectos, clientData.prospectos);
  db.tareas = mergeLists(db.tareas, clientData.tareas);
  db.ventas = mergeLists(db.ventas, clientData.ventas);
  db.gastos = mergeLists(db.gastos || [], clientData.gastos);
  db.renovaciones = mergeLists(db.renovaciones || [], clientData.renovaciones);

  writeDb(db);
  
  // Return the merged list to the client so the client can identify any "isNewFromApi" items to add to Google Sheets!
  res.json({
    success: true,
    message: "Sincronización completada con éxito",
    data: db
  });
});

// Reset flags once items have been synchronized into Google Sheets by the frontend
app.post("/api/sync/ack", validateApiKey, (req, res) => {
  const db = readDb();
  const { type, ids } = req.body; // e.g. type="clientes", ids=["id1", "id2"]
  
  if (db[type]) {
    db[type] = db[type].map((item: any) => {
      if (ids.includes(item.id)) {
        const { isNewFromApi, isUpdatedFromApi, ...rest } = item;
        return rest;
      }
      return item;
    });
    writeDb(db);
    return res.json({ success: true, message: `Flags removidos para ${type}` });
  }
  
  res.status(400).json({ success: false, error: "Tipo de dato no válido" });
});

// API Endpoints - INTERNAL SYNCHRONIZATION (Used by frontend, bypassing API key checks)
app.post("/api/internal/sync", (req, res) => {
  const db = readDb();
  const clientData = req.body;
  
  const mergeLists = (serverList: any[], clientList: any[] = []) => {
    const merged = [...serverList];
    
    clientList.forEach((cItem: any) => {
      const idx = merged.findIndex((sItem: any) => sItem.id === cItem.id);
      if (idx !== -1) {
        if (merged[idx].isNewFromApi || merged[idx].isUpdatedFromApi) {
          // Keep server version if it has pending changes from external API
        } else {
          merged[idx] = cItem;
        }
      } else {
        merged.push(cItem);
      }
    });

    return merged;
  };

  db.clientes = mergeLists(db.clientes, clientData.clientes);
  db.prospectos = mergeLists(db.prospectos, clientData.prospectos);
  db.tareas = mergeLists(db.tareas, clientData.tareas);
  db.ventas = mergeLists(db.ventas, clientData.ventas);
  db.gastos = mergeLists(db.gastos || [], clientData.gastos);
  db.renovaciones = mergeLists(db.renovaciones || [], clientData.renovaciones);

  writeDb(db);
  
  res.json({
    success: true,
    message: "Sincronización interna completada con éxito",
    data: db
  });
});

app.post("/api/internal/sync/ack", (req, res) => {
  const db = readDb();
  const { type, ids } = req.body;
  
  if (db[type]) {
    db[type] = db[type].map((item: any) => {
      if (ids.includes(item.id)) {
        const { isNewFromApi, isUpdatedFromApi, ...rest } = item;
        return rest;
      }
      return item;
    });
    writeDb(db);
    return res.json({ success: true, message: `Flags internos removidos para ${type}` });
  }
  
  res.status(400).json({ success: false, error: "Tipo de dato no válido" });
});


// Get internal API Key (internal only, used by frontend to display instructions)
app.get("/api/internal/config", (req, res) => {
  res.json({
    success: true,
    apiKey: API_KEY
  });
});

// Serve Vite or static files
async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

serveApp();
