import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import logoShield from './assets/images/centinela_logo_1783531546255.jpg';
import { 
  initAuth, 
  googleSignIn, 
  logout 
} from './googleAuth';
import { 
  searchSpreadsheet, 
  createSpreadsheet, 
  getClientes, 
  addCliente, 
  updateCliente, 
  deleteCliente 
} from './sheetsService';
import { 
  searchProspectosSpreadsheet, 
  createProspectosSpreadsheet, 
  getProspectos, 
  addProspecto, 
  updateProspecto, 
  deleteProspecto 
} from './prospectosService';
import { 
  searchVentasSpreadsheet, 
  createVentasSpreadsheet, 
  getVentas, 
  addVenta, 
  updateVenta, 
  deleteVenta 
} from './ventasService';
import { 
  searchGastosSpreadsheet, 
  createGastosSpreadsheet, 
  getGastos, 
  addGasto, 
  updateGasto, 
  deleteGasto 
} from './gastosService';
import { 
  searchRenovacionesSpreadsheet, 
  createRenovacionesSpreadsheet, 
  getRenovaciones, 
  addRenovacion, 
  updateRenovacion, 
  deleteRenovacion 
} from './renovacionesService';
import { 
  searchTareasSpreadsheet, 
  createTareasSpreadsheet, 
  getTareas, 
  addTarea, 
  updateTarea, 
  deleteTarea 
} from './tareasService';
import { Cliente, Prospecto, Venta, Gasto, Renovacion, Tarea } from './types';
import { 
  exportClientesToCSV, 
  exportProspectosToCSV,
  exportVentasToCSV,
  exportGastosToCSV,
  exportRenovacionesToCSV,
  exportTareasToCSV,
  generateNextId,
  generateNextProspectoId,
  generateNextVentaId,
  generateNextGastoId,
  generateNextRenovacionId,
  generateNextTareaId
} from './utils';
import { 
  Shield, 
  Search, 
  Plus, 
  Download, 
  Edit2, 
  Trash2, 
  LogOut, 
  FileSpreadsheet, 
  Database, 
  Lock, 
  RefreshCw, 
  ExternalLink,
  Users,
  Briefcase,
  Layers,
  TrendingUp,
  AlertCircle,
  X,
  Flame,
  Coins,
  CheckSquare,
  Check,
  Receipt,
  Calendar,
  Bell,
  LayoutDashboard,
  Building2,
  Settings,
  Upload
} from 'lucide-react';
import ClienteForm from './components/ClienteForm';
import ProspectoForm from './components/ProspectoForm';
import VentaForm from './components/VentaForm';
import GastoForm from './components/GastoForm';
import RenovacionForm from './components/RenovacionForm';
import MetricCards from './components/MetricCards';
import ProspectoMetricCards from './components/ProspectoMetricCards';
import VentaMetricCards from './components/VentaMetricCards';
import GastoMetricCards from './components/GastoMetricCards';
import RenovacionMetricCards from './components/RenovacionMetricCards';
import TareaForm from './components/TareaForm';
import TareaMetricCards from './components/TareaMetricCards';
import ReminderModal from './components/ReminderModal';
import Dashboard from './components/Dashboard';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active module
  const [activeModule, setActiveModule] = useState<'dashboard' | 'clientes' | 'prospectos' | 'ventas' | 'gastos' | 'renovaciones' | 'tareas'>('dashboard');

  // Sheets state - Clientes
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [spreadsheetName, setSpreadsheetName] = useState<string>('');
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Sheets state - Prospectos
  const [prospectosSpreadsheetId, setProspectosSpreadsheetId] = useState<string | null>(null);
  const [prospectosSpreadsheetName, setProspectosSpreadsheetName] = useState<string>('');
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);

  // Sheets state - Ventas
  const [ventasSpreadsheetId, setVentasSpreadsheetId] = useState<string | null>(null);
  const [ventasSpreadsheetName, setVentasSpreadsheetName] = useState<string>('');
  const [ventas, setVentas] = useState<Venta[]>([]);

  // Sheets state - Gastos
  const [gastosSpreadsheetId, setGastosSpreadsheetId] = useState<string | null>(null);
  const [gastosSpreadsheetName, setGastosSpreadsheetName] = useState<string>('');
  const [gastos, setGastos] = useState<Gasto[]>([]);

  // Sheets state - Renovaciones
  const [renovacionesSpreadsheetId, setRenovacionesSpreadsheetId] = useState<string | null>(null);
  const [renovacionesSpreadsheetName, setRenovacionesSpreadsheetName] = useState<string>('');
  const [renovaciones, setRenovaciones] = useState<Renovacion[]>([]);

  // Sheets state - Tareas
  const [tareasSpreadsheetId, setTareasSpreadsheetId] = useState<string | null>(null);
  const [tareasSpreadsheetName, setTareasSpreadsheetName] = useState<string>('');
  const [tareas, setTareas] = useState<Tarea[]>([]);

  // Common sheet states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Company Configuration State
  const [companyName, setCompanyName] = useState<string>(() => localStorage.getItem('companyName') || '');
  const [companyLogo, setCompanyLogo] = useState<string>(() => localStorage.getItem('companyLogo') || '');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // Filter & Search states - Clientes
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');

  // Filter & Search states - Prospectos
  const [prospectosSearchQuery, setProspectosSearchQuery] = useState('');
  const [prospectosEstadoFilter, setProspectosEstadoFilter] = useState('Todos');

  // Filter & Search states - Ventas
  const [ventasSearchQuery, setVentasSearchQuery] = useState('');
  const [ventasEstadoFilter, setVentasEstadoFilter] = useState('Todos');
  const [ventasFechaDesde, setVentasFechaDesde] = useState('');
  const [ventasFechaHasta, setVentasFechaHasta] = useState('');

  // Filter & Search states - Gastos
  const [gastosSearchQuery, setGastosSearchQuery] = useState('');
  const [gastosCategoriaFilter, setGastosCategoriaFilter] = useState('Todos');
  const [gastosFechaDesde, setGastosFechaDesde] = useState('');
  const [gastosFechaHasta, setGastosFechaHasta] = useState('');

  // Filter & Search states - Renovaciones
  const [renovacionesSearchQuery, setRenovacionesSearchQuery] = useState('');
  const [renovacionesEstadoFilter, setRenovacionesEstadoFilter] = useState('Todos');

  // Filter & Search states - Tareas
  const [tareasSearchQuery, setTareasSearchQuery] = useState('');
  const [tareasPrioridadFilter, setTareasPrioridadFilter] = useState('Todos');
  const [tareasEstadoFilter, setTareasEstadoFilter] = useState('Todos');

  // Form states - Clientes
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Form states - Prospectos
  const [isProspectosFormOpen, setIsProspectosFormOpen] = useState(false);
  const [selectedProspecto, setSelectedProspecto] = useState<Prospecto | null>(null);

  // Form states - Ventas
  const [isVentasFormOpen, setIsVentasFormOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);

  // Form states - Gastos
  const [isGastosFormOpen, setIsGastosFormOpen] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);

  // Form states - Renovaciones
  const [isRenovacionesFormOpen, setIsRenovacionesFormOpen] = useState(false);
  const [selectedRenovacion, setSelectedRenovacion] = useState<Renovacion | null>(null);
  const [selectedRenovacionForReminder, setSelectedRenovacionForReminder] = useState<Renovacion | null>(null);

  // Form states - Tareas
  const [isTareasFormOpen, setIsTareasFormOpen] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);

  // Delete confirmation modal states
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [prospectoToDelete, setProspectoToDelete] = useState<Prospecto | null>(null);
  const [ventaToDelete, setVentaToDelete] = useState<Venta | null>(null);
  const [gastoToDelete, setGastoToDelete] = useState<Gasto | null>(null);
  const [renovacionToDelete, setRenovacionToDelete] = useState<Renovacion | null>(null);
  const [tareaToDelete, setTareaToDelete] = useState<Tarea | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // Initialize auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Sheet Loading when token becomes available
  useEffect(() => {
    if (token) {
      loadSpreadsheetData(token);
    }
  }, [token]);

  // Load Spreadsheet metadata & data
  const loadSpreadsheetData = async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Load Clientes
      const sheetFile = await searchSpreadsheet(accessToken);
      if (sheetFile) {
        setSpreadsheetId(sheetFile.id);
        setSpreadsheetName(sheetFile.name);
        const list = await getClientes(accessToken, sheetFile.id);
        setClientes(list);
      } else {
        setSpreadsheetId(null);
        setSpreadsheetName('');
        setClientes([]);
      }

      // 2. Load Prospectos
      const prosFile = await searchProspectosSpreadsheet(accessToken);
      if (prosFile) {
        setProspectosSpreadsheetId(prosFile.id);
        setProspectosSpreadsheetName(prosFile.name);
        const list = await getProspectos(accessToken, prosFile.id);
        setProspectos(list);
      } else {
        setProspectosSpreadsheetId(null);
        setProspectosSpreadsheetName('');
        setProspectos([]);
      }

      // 3. Load Ventas
      const ventasFile = await searchVentasSpreadsheet(accessToken);
      if (ventasFile) {
        setVentasSpreadsheetId(ventasFile.id);
        setVentasSpreadsheetName(ventasFile.name);
        const list = await getVentas(accessToken, ventasFile.id);
        setVentas(list);
      } else {
        setVentasSpreadsheetId(null);
        setVentasSpreadsheetName('');
        setVentas([]);
      }

      // 4. Load Gastos
      const gastosFile = await searchGastosSpreadsheet(accessToken);
      if (gastosFile) {
        setGastosSpreadsheetId(gastosFile.id);
        setGastosSpreadsheetName(gastosFile.name);
        const list = await getGastos(accessToken, gastosFile.id);
        setGastos(list);
      } else {
        setGastosSpreadsheetId(null);
        setGastosSpreadsheetName('');
        setGastos([]);
      }

      // 5. Load Renovaciones
      const renovacionesFile = await searchRenovacionesSpreadsheet(accessToken);
      if (renovacionesFile) {
        setRenovacionesSpreadsheetId(renovacionesFile.id);
        setRenovacionesSpreadsheetName(renovacionesFile.name);
        const list = await getRenovaciones(accessToken, renovacionesFile.id);
        setRenovaciones(list);
      } else {
        setRenovacionesSpreadsheetId(null);
        setRenovacionesSpreadsheetName('');
        setRenovaciones([]);
      }

      // 6. Load Tareas
      const tareasFile = await searchTareasSpreadsheet(accessToken);
      if (tareasFile) {
        setTareasSpreadsheetId(tareasFile.id);
        setTareasSpreadsheetName(tareasFile.name);
        const list = await getTareas(accessToken, tareasFile.id);
        setTareas(list);
      } else {
        setTareasSpreadsheetId(null);
        setTareasSpreadsheetName('');
        setTareas([]);
      }
    } catch (err: any) {
      console.error(err);
      setError('No se pudo cargar la información de Google Sheets. Asegúrate de tener permisos o intenta reconectar.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new spreadsheet for Clientes
  const handleCreateSheet = async () => {
    if (!token) return;
    setIsCreatingSheet(true);
    setError(null);
    try {
      const newSheet = await createSpreadsheet(token);
      setSpreadsheetId(newSheet.id);
      setSpreadsheetName(newSheet.name);
      showToast('Hoja de Google Sheets "Clientes" creada exitosamente.');
      const list = await getClientes(token, newSheet.id);
      setClientes(list);
    } catch (err: any) {
      console.error(err);
      setError('Error al crear la hoja de cálculo. Intente nuevamente.');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Create a new spreadsheet for Prospectos
  const handleCreateProspectosSheet = async () => {
    if (!token) return;
    setIsCreatingSheet(true);
    setError(null);
    try {
      const newSheet = await createProspectosSpreadsheet(token);
      setProspectosSpreadsheetId(newSheet.id);
      setProspectosSpreadsheetName(newSheet.name);
      showToast('Hoja de Google Sheets "Prospectos" creada exitosamente.');
      const list = await getProspectos(token, newSheet.id);
      setProspectos(list);
    } catch (err: any) {
      console.error(err);
      setError('Error al crear la hoja de cálculo de Prospectos. Intente nuevamente.');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Create a new spreadsheet for Ventas
  const handleCreateVentasSheet = async () => {
    if (!token) return;
    setIsCreatingSheet(true);
    setError(null);
    try {
      const newSheet = await createVentasSpreadsheet(token);
      setVentasSpreadsheetId(newSheet.id);
      setVentasSpreadsheetName(newSheet.name);
      showToast('Hoja de Google Sheets "Ventas" creada exitosamente.');
      const list = await getVentas(token, newSheet.id);
      setVentas(list);
    } catch (err: any) {
      console.error(err);
      setError('Error al crear la hoja de cálculo de Ventas. Intente nuevamente.');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Create a new spreadsheet for Gastos
  const handleCreateGastosSheet = async () => {
    if (!token) return;
    setIsCreatingSheet(true);
    setError(null);
    try {
      const newSheet = await createGastosSpreadsheet(token);
      setGastosSpreadsheetId(newSheet.id);
      setGastosSpreadsheetName(newSheet.name);
      showToast('Hoja de Google Sheets "Gastos" creada exitosamente.');
      const list = await getGastos(token, newSheet.id);
      setGastos(list);
    } catch (err: any) {
      console.error(err);
      setError('Error al crear la hoja de cálculo de Gastos. Intente nuevamente.');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Create a new spreadsheet for Renovaciones
  const handleCreateRenovacionesSheet = async () => {
    if (!token) return;
    setIsCreatingSheet(true);
    setError(null);
    try {
      const newSheet = await createRenovacionesSpreadsheet(token);
      setRenovacionesSpreadsheetId(newSheet.id);
      setRenovacionesSpreadsheetName(newSheet.name);
      showToast('Hoja de Google Sheets "Renovaciones" creada exitosamente.');
      const list = await getRenovaciones(token, newSheet.id);
      setRenovaciones(list);
    } catch (err: any) {
      console.error(err);
      setError('Error al crear la hoja de cálculo de Renovaciones. Intente nuevamente.');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Create a new spreadsheet for Tareas
  const handleCreateTareasSheet = async () => {
    if (!token) return;
    setIsCreatingSheet(true);
    setError(null);
    try {
      const newSheet = await createTareasSpreadsheet(token);
      setTareasSpreadsheetId(newSheet.id);
      setTareasSpreadsheetName(newSheet.name);
      showToast('Hoja de Google Sheets "Tareas" creada exitosamente.');
      const list = await getTareas(token, newSheet.id);
      setTareas(list);
    } catch (err: any) {
      console.error(err);
      setError('Error al crear la hoja de cálculo de Tareas. Intente nuevamente.');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Google Sign-in Handler
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError('No se pudo iniciar sesión con Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setSpreadsheetId(null);
      setClientes([]);
      setProspectosSpreadsheetId(null);
      setProspectos([]);
      setVentasSpreadsheetId(null);
      setVentas([]);
      setGastosSpreadsheetId(null);
      setGastos([]);
      setRenovacionesSpreadsheetId(null);
      setRenovaciones([]);
      setNeedsAuth(true);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Show status feedback
  const showToast = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Add or Edit client save handler
  const handleSaveCliente = async (cliente: Cliente) => {
    if (!token || !spreadsheetId) return;

    try {
      if (selectedCliente) {
        // Update operation
        await updateCliente(token, spreadsheetId, cliente);
        showToast(`Cliente "${cliente.empresa}" actualizado exitosamente.`);
      } else {
        // Add operation
        await addCliente(token, spreadsheetId, cliente);
        showToast(`Cliente "${cliente.empresa}" agregado exitosamente.`);
      }

      // Close modal & reload list
      setIsFormOpen(false);
      setSelectedCliente(null);
      
      // Auto-refresh data
      const list = await getClientes(token, spreadsheetId);
      setClientes(list);
    } catch (err: any) {
      console.error(err);
      throw new Error(err?.message || 'Error al guardar los datos.');
    }
  };

  // Add or Edit prospecto save handler
  const handleSaveProspecto = async (prospecto: Prospecto) => {
    if (!token || !prospectosSpreadsheetId) return;

    try {
      if (selectedProspecto) {
        // Update operation
        await updateProspecto(token, prospectosSpreadsheetId, prospecto);
        showToast(`Prospecto "${prospecto.empresa}" actualizado exitosamente.`);
      } else {
        // Add operation
        await addProspecto(token, prospectosSpreadsheetId, prospecto);
        showToast(`Prospecto "${prospecto.empresa}" agregado exitosamente.`);
      }

      // Close modal & reload list
      setIsProspectosFormOpen(false);
      setSelectedProspecto(null);

      // Auto-refresh data
      const list = await getProspectos(token, prospectosSpreadsheetId);
      setProspectos(list);
    } catch (err: any) {
      console.error(err);
      throw new Error(err?.message || 'Error al guardar los datos.');
    }
  };

  // Open form for adding clients
  const handleOpenAddForm = () => {
    setSelectedCliente(null);
    setIsFormOpen(true);
  };

  // Open form for editing clients
  const handleOpenEditForm = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsFormOpen(true);
  };

  // Initiate client deletion
  const handleRequestDelete = (cliente: Cliente) => {
    setClienteToDelete(cliente);
  };

  // Confirm client deletion
  const handleConfirmDelete = async () => {
    if (!token || !spreadsheetId || !clienteToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCliente(token, spreadsheetId, clienteToDelete.id);
      showToast(`Cliente "${clienteToDelete.empresa}" eliminado correctamente.`);
      
      // Close confirmation dialog
      setClienteToDelete(null);
      
      // Auto-refresh data
      const list = await getClientes(token, spreadsheetId);
      setClientes(list);
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar el cliente: ' + (err?.message || 'Intente nuevamente.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Open form for adding prospectos
  const handleOpenAddProspectoForm = () => {
    setSelectedProspecto(null);
    setIsProspectosFormOpen(true);
  };

  // Open form for editing prospectos
  const handleOpenEditProspectoForm = (prospecto: Prospecto) => {
    setSelectedProspecto(prospecto);
    setIsProspectosFormOpen(true);
  };

  // Initiate prospecto deletion
  const handleRequestProspectoDelete = (prospecto: Prospecto) => {
    setProspectoToDelete(prospecto);
  };

  // Confirm prospecto deletion
  const handleConfirmProspectoDelete = async () => {
    if (!token || !prospectosSpreadsheetId || !prospectoToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProspecto(token, prospectosSpreadsheetId, prospectoToDelete.id);
      showToast(`Prospecto "${prospectoToDelete.empresa}" eliminado correctamente.`);
      
      // Close confirmation dialog
      setProspectoToDelete(null);
      
      // Auto-refresh data
      const list = await getProspectos(token, prospectosSpreadsheetId);
      setProspectos(list);
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar el prospecto: ' + (err?.message || 'Intente nuevamente.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Add or Edit Venta save handler
  const handleSaveVenta = async (venta: Venta) => {
    if (!token || !ventasSpreadsheetId) return;

    try {
      if (selectedVenta) {
        // Update operation
        await updateVenta(token, ventasSpreadsheetId, venta);
        showToast(`Venta para "${venta.cliente}" actualizada exitosamente.`);
      } else {
        // Add operation
        await addVenta(token, ventasSpreadsheetId, venta);
        showToast(`Venta para "${venta.cliente}" agregada exitosamente.`);
      }

      // Close modal & reload list
      setIsVentasFormOpen(false);
      setSelectedVenta(null);

      // Auto-refresh data
      const list = await getVentas(token, ventasSpreadsheetId);
      setVentas(list);
    } catch (err: any) {
      console.error(err);
      throw new Error(err?.message || 'Error al guardar los datos de la venta.');
    }
  };

  // Open form for adding ventas
  const handleOpenAddVentaForm = () => {
    setSelectedVenta(null);
    setIsVentasFormOpen(true);
  };

  // Open form for editing ventas
  const handleOpenEditVentaForm = (venta: Venta) => {
    setSelectedVenta(venta);
    setIsVentasFormOpen(true);
  };

  // Initiate venta deletion
  const handleRequestVentaDelete = (venta: Venta) => {
    setVentaToDelete(venta);
  };

  // Confirm venta deletion
  const handleConfirmVentaDelete = async () => {
    if (!token || !ventasSpreadsheetId || !ventaToDelete) return;

    setIsDeleting(true);
    try {
      await deleteVenta(token, ventasSpreadsheetId, ventaToDelete.id);
      showToast(`Registro de venta "${ventaToDelete.id}" eliminado correctamente.`);
      
      // Close confirmation dialog
      setVentaToDelete(null);
      
      // Auto-refresh data
      const list = await getVentas(token, ventasSpreadsheetId);
      setVentas(list);
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar el registro de venta: ' + (err?.message || 'Intente nuevamente.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Export visible data according to filters & search
  const handleExport = () => {
    if (filteredClientes.length === 0) {
      alert('No hay clientes visibles para exportar.');
      return;
    }
    exportClientesToCSV(filteredClientes);
  };

  // Export visible prospectos
  const handleExportProspectos = () => {
    if (filteredProspectos.length === 0) {
      alert('No hay prospectos visibles para exportar.');
      return;
    }
    exportProspectosToCSV(filteredProspectos);
  };

  // Export visible ventas
  const handleExportVentas = () => {
    if (filteredVentas.length === 0) {
      alert('No hay ventas visibles para exportar.');
      return;
    }
    exportVentasToCSV(filteredVentas);
  };

  // Add or Edit Gasto save handler
  const handleSaveGasto = async (gasto: Gasto) => {
    if (!token || !gastosSpreadsheetId) return;

    try {
      if (selectedGasto) {
        // Update operation
        await updateGasto(token, gastosSpreadsheetId, gasto);
        showToast(`Gasto "${gasto.id}" actualizado exitosamente.`);
      } else {
        // Add operation
        await addGasto(token, gastosSpreadsheetId, gasto);
        showToast(`Gasto "${gasto.id}" agregado exitosamente.`);
      }

      // Close modal & reload list
      setIsGastosFormOpen(false);
      setSelectedGasto(null);

      // Auto-refresh data
      const list = await getGastos(token, gastosSpreadsheetId);
      setGastos(list);
    } catch (err: any) {
      console.error(err);
      throw new Error(err?.message || 'Error al guardar los datos del gasto.');
    }
  };

  // Open form for adding gastos
  const handleOpenAddGastoForm = () => {
    setSelectedGasto(null);
    setIsGastosFormOpen(true);
  };

  // Open form for editing gastos
  const handleOpenEditGastoForm = (gasto: Gasto) => {
    setSelectedGasto(gasto);
    setIsGastosFormOpen(true);
  };

  // Initiate gasto deletion
  const handleRequestGastoDelete = (gasto: Gasto) => {
    setGastoToDelete(gasto);
  };

  // Confirm gasto deletion
  const handleConfirmGastoDelete = async () => {
    if (!token || !gastosSpreadsheetId || !gastoToDelete) return;

    setIsDeleting(true);
    try {
      await deleteGasto(token, gastosSpreadsheetId, gastoToDelete.id);
      showToast(`Registro de gasto "${gastoToDelete.id}" eliminado correctamente.`);
      
      // Close confirmation dialog
      setGastoToDelete(null);
      
      // Auto-refresh data
      const list = await getGastos(token, gastosSpreadsheetId);
      setGastos(list);
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar el registro de gasto: ' + (err?.message || 'Intente nuevamente.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Export visible gastos
  const handleExportGastos = () => {
    if (filteredGastos.length === 0) {
      alert('No hay gastos visibles para exportar.');
      return;
    }
    exportGastosToCSV(filteredGastos);
  };

  // Add or Edit Renovacion save handler
  const handleSaveRenovacion = async (renovacion: Renovacion) => {
    if (!token || !renovacionesSpreadsheetId) return;

    try {
      if (selectedRenovacion) {
        // Update operation
        await updateRenovacion(token, renovacionesSpreadsheetId, renovacion);
        showToast(`Renovación para "${renovacion.cliente}" actualizada exitosamente.`);
      } else {
        // Add operation
        await addRenovacion(token, renovacionesSpreadsheetId, renovacion);
        showToast(`Renovación para "${renovacion.cliente}" agregada exitosamente.`);
      }

      // Close modal & reload list
      setIsRenovacionesFormOpen(false);
      setSelectedRenovacion(null);

      // Auto-refresh data
      const list = await getRenovaciones(token, renovacionesSpreadsheetId);
      setRenovaciones(list);
    } catch (err: any) {
      console.error(err);
      throw new Error(err?.message || 'Error al guardar los datos de la renovación.');
    }
  };

  // Open form for adding renovaciones
  const handleOpenAddRenovacionForm = () => {
    setSelectedRenovacion(null);
    setIsRenovacionesFormOpen(true);
  };

  // Open form for editing renovaciones
  const handleOpenEditRenovacionForm = (renovacion: Renovacion) => {
    setSelectedRenovacion(renovacion);
    setIsRenovacionesFormOpen(true);
  };

  // Initiate renovacion deletion
  const handleRequestRenovacionDelete = (renovacion: Renovacion) => {
    setRenovacionToDelete(renovacion);
  };

  // Confirm renovacion deletion
  const handleConfirmRenovacionDelete = async () => {
    if (!token || !renovacionesSpreadsheetId || !renovacionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteRenovacion(token, renovacionesSpreadsheetId, renovacionToDelete.id);
      showToast(`Registro de renovación "${renovacionToDelete.id}" eliminado correctamente.`);
      
      // Close confirmation dialog
      setRenovacionToDelete(null);
      
      // Auto-refresh data
      const list = await getRenovaciones(token, renovacionesSpreadsheetId);
      setRenovaciones(list);
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar la renovación: ' + (err?.message || 'Intente nuevamente.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Export visible renovaciones
  const handleExportRenovaciones = () => {
    if (filteredRenovaciones.length === 0) {
      alert('No hay renovaciones visibles para exportar.');
      return;
    }
    exportRenovacionesToCSV(filteredRenovaciones);
  };

  // Add or Edit Tarea save handler
  const handleSaveTarea = async (tarea: Tarea) => {
    if (!token || !tareasSpreadsheetId) return;

    try {
      if (selectedTarea) {
        // Update operation
        await updateTarea(token, tareasSpreadsheetId, tarea);
        showToast(`Tarea "${tarea.titulo}" actualizada exitosamente.`);
      } else {
        // Add operation
        await addTarea(token, tareasSpreadsheetId, tarea);
        showToast(`Tarea "${tarea.titulo}" agregada exitosamente.`);
      }

      // Close modal & reload list
      setIsTareasFormOpen(false);
      setSelectedTarea(null);

      // Auto-refresh data
      const list = await getTareas(token, tareasSpreadsheetId);
      setTareas(list);
    } catch (err: any) {
      console.error(err);
      throw new Error(err?.message || 'Error al guardar los datos de la tarea.');
    }
  };

  // Open form for adding tareas
  const handleOpenAddTareaForm = () => {
    setSelectedTarea(null);
    setIsTareasFormOpen(true);
  };

  // Open form for editing tareas
  const handleOpenEditTareaForm = (tarea: Tarea) => {
    setSelectedTarea(tarea);
    setIsTareasFormOpen(true);
  };

  // Initiate tarea deletion
  const handleRequestTareaDelete = (tarea: Tarea) => {
    setTareaToDelete(tarea);
  };

  // Confirm tarea deletion
  const handleConfirmTareaDelete = async () => {
    if (!token || !tareasSpreadsheetId || !tareaToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTarea(token, tareasSpreadsheetId, tareaToDelete.id);
      showToast(`Tarea "${tareaToDelete.id}" eliminada correctamente.`);
      
      // Close confirmation dialog
      setTareaToDelete(null);
      
      // Auto-refresh data
      const list = await getTareas(token, tareasSpreadsheetId);
      setTareas(list);
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar la tarea: ' + (err?.message || 'Intente nuevamente.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Tarea status (shortcut from list/row)
  const handleToggleTareaStatus = async (tarea: Tarea) => {
    if (!token || !tareasSpreadsheetId) return;

    const originalState = tarea.estado;
    const isCompleted = originalState === 'Completada';
    const nuevoEstado = isCompleted ? 'Pendiente' : 'Completada';
    
    const now = new Date();
    const localDate = now.toISOString().split('T')[0];
    const localTime = now.toTimeString().split(' ')[0].substring(0, 5);

    const updatedTarea: Tarea = {
      ...tarea,
      estado: nuevoEstado,
      fechaFinalizacion: nuevoEstado === 'Completada' ? localDate : '',
      horaFinalizacion: nuevoEstado === 'Completada' ? localTime : '',
    };

    try {
      // Optimistic state update in UI
      setTareas(prev => prev.map(t => t.id === tarea.id ? updatedTarea : t));
      
      // Update in Google Sheets
      await updateTarea(token, tareasSpreadsheetId, updatedTarea);
      showToast(`Tarea marcada como ${nuevoEstado === 'Completada' ? 'Completada' : 'Pendiente'}.`);
    } catch (err: any) {
      console.error(err);
      // Revert optimistic update
      setTareas(prev => prev.map(t => t.id === tarea.id ? tarea : t));
      alert('Error al actualizar el estado de la tarea en Google Sheets.');
    }
  };

  // Export visible tareas
  const handleExportTareas = () => {
    if (filteredTareas.length === 0) {
      alert('No hay tareas visibles para exportar.');
      return;
    }
    exportTareasToCSV(filteredTareas);
  };

  // Filter & Search computation - Tareas
  const filteredTareas = tareas.filter((t) => {
    const matchesSearch = 
      t.titulo.toLowerCase().includes(tareasSearchQuery.toLowerCase()) ||
      t.descripcion.toLowerCase().includes(tareasSearchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(tareasSearchQuery.toLowerCase());

    const matchesPrioridad = tareasPrioridadFilter === 'Todos' || t.prioridad === tareasPrioridadFilter;
    const matchesEstado = tareasEstadoFilter === 'Todos' || t.estado === tareasEstadoFilter;

    return matchesSearch && matchesPrioridad && matchesEstado;
  });

  // Filter & Search computation - Clientes
  const filteredClientes = clientes.filter((c) => {
    const matchesSearch = 
      c.empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contacto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.servicio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEstado = estadoFilter === 'Todos' || c.estado === estadoFilter;

    return matchesSearch && matchesEstado;
  });

  // Filter & Search computation - Prospectos
  const filteredProspectos = prospectos.filter((p) => {
    const matchesSearch = 
      p.empresa.toLowerCase().includes(prospectosSearchQuery.toLowerCase()) ||
      p.contacto.toLowerCase().includes(prospectosSearchQuery.toLowerCase()) ||
      p.correo.toLowerCase().includes(prospectosSearchQuery.toLowerCase()) ||
      p.servicioInteres.toLowerCase().includes(prospectosSearchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(prospectosSearchQuery.toLowerCase());

    const matchesEstado = prospectosEstadoFilter === 'Todos' || p.estado === prospectosEstadoFilter;

    return matchesSearch && matchesEstado;
  });

  // Filter & Search computation - Ventas
  const filteredVentas = ventas.filter((v) => {
    const matchesSearch = 
      v.cliente.toLowerCase().includes(ventasSearchQuery.toLowerCase()) ||
      v.servicio.toLowerCase().includes(ventasSearchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(ventasSearchQuery.toLowerCase()) ||
      (v.observaciones && v.observaciones.toLowerCase().includes(ventasSearchQuery.toLowerCase()));

    const matchesEstado = ventasEstadoFilter === 'Todos' || v.estadoPago === ventasEstadoFilter;

    let matchesFecha = true;
    if (ventasFechaDesde) {
      matchesFecha = matchesFecha && (v.fecha >= ventasFechaDesde);
    }
    if (ventasFechaHasta) {
      matchesFecha = matchesFecha && (v.fecha <= ventasFechaHasta);
    }

    return matchesSearch && matchesEstado && matchesFecha;
  });

  // Filter & Search computation - Gastos
  const filteredGastos = gastos.filter((g) => {
    const matchesSearch = 
      g.categoria.toLowerCase().includes(gastosSearchQuery.toLowerCase()) ||
      g.descripcion.toLowerCase().includes(gastosSearchQuery.toLowerCase()) ||
      g.id.toLowerCase().includes(gastosSearchQuery.toLowerCase());

    const matchesCategoria = gastosCategoriaFilter === 'Todos' || g.categoria === gastosCategoriaFilter;

    let matchesFecha = true;
    if (gastosFechaDesde) {
      matchesFecha = matchesFecha && (g.fecha >= gastosFechaDesde);
    }
    if (gastosFechaHasta) {
      matchesFecha = matchesFecha && (g.fecha <= gastosFechaHasta);
    }

    return matchesSearch && matchesCategoria && matchesFecha;
  });

  // Filter & Search computation - Renovaciones
  const filteredRenovaciones = renovaciones.filter((r) => {
    const matchesSearch = 
      r.cliente.toLowerCase().includes(renovacionesSearchQuery.toLowerCase()) ||
      r.servicio.toLowerCase().includes(renovacionesSearchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(renovacionesSearchQuery.toLowerCase());

    const matchesEstado = renovacionesEstadoFilter === 'Todos' || r.estado === renovacionesEstadoFilter;

    return matchesSearch && matchesEstado;
  });

  const siguienteId = generateNextId(clientes);
  const siguienteProspectoId = generateNextProspectoId(prospectos);
  const siguienteVentaId = generateNextVentaId(ventas);
  const siguienteGastoId = generateNextGastoId(gastos);
  const siguienteRenovacionId = generateNextRenovacionId(renovaciones);
  const siguienteTareaId = generateNextTareaId(tareas);

  // Authentication UI (Login Screen)
  if (needsAuth) {
    return (
      <div 
        id="login-screen"
        className="min-h-screen bg-gradient-to-tr from-[#EBF2FF] via-[#F3F6FF] to-[#E5F5FF] flex flex-col justify-center items-center p-4 relative overflow-hidden"
      >
        {/* Ambient background flowing blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#2E5BFF]/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF5CE3]/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#60A5FA]/10 blur-[140px]" />

        {/* Glass Card Container */}
        <div className="w-full max-w-md bg-white/45 backdrop-blur-xl p-8 rounded-[32px] shadow-[0_16px_48px_rgba(46,91,255,0.06)] border border-white/80 flex flex-col items-center relative z-10">
          {/* Centinela Glowing Glass Logo Emblem */}
          <div className="relative w-20 h-20 rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(46,91,255,0.3)] flex items-center justify-center mb-6 border border-white/20 bg-slate-950">
            <img 
              src={logoShield} 
              alt="Centinela Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
            <span className="absolute inset-0 rounded-[24px] border border-white/30 animate-pulse pointer-events-none" />
          </div>

          <h1 className="text-3xl font-extrabold font-display text-slate-800 tracking-tight">
            Centinela
          </h1>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1.5 mb-8">
            MANAGEMENT SYSTEM
          </p>

          <p className="text-sm text-slate-500 text-center leading-relaxed mb-8 max-w-xs font-medium">
            Inicia sesión con tu cuenta de Google para sincronizar y gestionar tu negocio directamente en tu hoja de cálculo.
          </p>

          <button
            id="login-button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-12 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 border border-slate-200/60 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(46,91,255,0.08)] transition-all active:scale-[0.98] disabled:opacity-50 text-sm cursor-pointer"
          >
            {isLoggingIn ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-[#2E5BFF]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-slate-500 font-semibold">Conectando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Iniciar sesión con Google</span>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Application Layout UI
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#EBF2FF] via-[#F3F6FF] to-[#E5F5FF] flex text-slate-800 font-sans relative overflow-hidden">
      
      {/* Ambient background flowing blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#2E5BFF]/10 blur-[130px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#FF5CE3]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[55%] h-[55%] rounded-full bg-[#60A5FA]/10 blur-[140px]" />
      </div>

      {/* Main container wrappers for glass sidebar and main view */}
      <div className="flex flex-1 w-full relative z-10">
        
        {/* Toast Feedback Popup */}
        {successMessage && (
          <div 
            id="success-toast"
            className="fixed bottom-6 right-6 z-50 bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-sm animate-in slide-in-from-bottom-5 duration-200 border border-white/10"
          >
            <span className="w-2 h-2 rounded-full bg-[#2E5BFF] animate-ping" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Sidebar Layout */}
        <aside 
          id="app-sidebar"
          className="w-64 bg-white/50 backdrop-blur-xl border-r border-white/80 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(46,91,255,0.02)]"
        >
          {/* Brand Title with Glowing Emblem */}
          <div className="p-6 border-b border-slate-100/60 flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(46,91,255,0.3)] bg-slate-950">
              <img 
                src={logoShield} 
                alt="Centinela Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
              <span className="absolute inset-0 rounded-xl border border-white/20 animate-pulse pointer-events-none" />
            </div>
            <div>
              <span className="font-bold text-lg font-display text-slate-800 tracking-tight block leading-none">Centinela</span>
              <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
                MANAGEMENT SYSTEM
              </span>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <span className="block px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Módulos
            </span>

            {/* Dashboard (ENABLED) */}
            <button
              id="nav-dashboard"
              onClick={() => setActiveModule('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
                activeModule === 'dashboard'
                  ? 'bg-[#2E5BFF]/10 text-[#2E5BFF] border border-[#2E5BFF]/10 shadow-[0_4px_15px_rgba(46,91,255,0.06)]'
                  : 'text-slate-500 hover:text-[#2E5BFF] hover:bg-[#2E5BFF]/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard size={18} className={activeModule === 'dashboard' ? 'text-[#2E5BFF]' : 'text-slate-400'} />
                <span>Dashboard</span>
              </div>
              {activeModule === 'dashboard' && <span className="w-1.5 h-1.5 bg-[#2E5BFF] rounded-full shadow-[0_0_8px_#2E5BFF]" />}
            </button>

            {/* Clientes (ENABLED) */}
            <button
              id="nav-clientes"
              onClick={() => setActiveModule('clientes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
                activeModule === 'clientes'
                  ? 'bg-[#2E5BFF]/10 text-[#2E5BFF] border border-[#2E5BFF]/10 shadow-[0_4px_15px_rgba(46,91,255,0.06)]'
                  : 'text-slate-500 hover:text-[#2E5BFF] hover:bg-[#2E5BFF]/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users size={18} className={activeModule === 'clientes' ? 'text-[#2E5BFF]' : 'text-slate-400'} />
                <span>Clientes</span>
              </div>
              {activeModule === 'clientes' && <span className="w-1.5 h-1.5 bg-[#2E5BFF] rounded-full shadow-[0_0_8px_#2E5BFF]" />}
            </button>

            {/* Prospectos (ENABLED) */}
            <button
              id="nav-prospectos"
              onClick={() => setActiveModule('prospectos')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
                activeModule === 'prospectos'
                  ? 'bg-[#2E5BFF]/10 text-[#2E5BFF] border border-[#2E5BFF]/10 shadow-[0_4px_15px_rgba(46,91,255,0.06)]'
                  : 'text-slate-500 hover:text-[#2E5BFF] hover:bg-[#2E5BFF]/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Layers size={18} className={activeModule === 'prospectos' ? 'text-[#2E5BFF]' : 'text-slate-400'} />
                <span>Prospectos</span>
              </div>
              {activeModule === 'prospectos' && <span className="w-1.5 h-1.5 bg-[#2E5BFF] rounded-full shadow-[0_0_8px_#2E5BFF]" />}
            </button>

          {/* Ventas (ENABLED) */}
          <button
            id="nav-ventas"
            onClick={() => setActiveModule('ventas')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
              activeModule === 'ventas'
                ? 'bg-[#2E5BFF]/10 text-[#2E5BFF] border border-[#2E5BFF]/10 shadow-[0_4px_15px_rgba(46,91,255,0.06)]'
                : 'text-slate-500 hover:text-[#2E5BFF] hover:bg-[#2E5BFF]/5'
            }`}
          >
            <div className="flex items-center space-x-3">
              <TrendingUp size={18} className={activeModule === 'ventas' ? 'text-[#2E5BFF]' : 'text-slate-400'} />
              <span>Ventas</span>
            </div>
            {activeModule === 'ventas' && <span className="w-1.5 h-1.5 bg-[#2E5BFF] rounded-full shadow-[0_0_8px_#2E5BFF]" />}
          </button>

          {/* Gastos (ENABLED) */}
          <button
            id="nav-gastos"
            onClick={() => setActiveModule('gastos')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
              activeModule === 'gastos'
                ? 'bg-[#2E5BFF]/10 text-[#2E5BFF] border border-[#2E5BFF]/10 shadow-[0_4px_15px_rgba(46,91,255,0.06)]'
                : 'text-slate-500 hover:text-[#2E5BFF] hover:bg-[#2E5BFF]/5'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Receipt size={18} className={activeModule === 'gastos' ? 'text-[#2E5BFF]' : 'text-slate-400'} />
              <span>Gastos</span>
            </div>
            {activeModule === 'gastos' && <span className="w-1.5 h-1.5 bg-[#2E5BFF] rounded-full shadow-[0_0_8px_#2E5BFF]" />}
          </button>

          {/* Renovaciones (ENABLED) */}
          <button
            id="nav-renovaciones"
            onClick={() => setActiveModule('renovaciones')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
              activeModule === 'renovaciones'
                ? 'bg-[#2E5BFF]/10 text-[#2E5BFF] border border-[#2E5BFF]/10 shadow-[0_4px_15px_rgba(46,91,255,0.06)]'
                : 'text-slate-500 hover:text-[#2E5BFF] hover:bg-[#2E5BFF]/5'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Calendar size={18} className={activeModule === 'renovaciones' ? 'text-[#2E5BFF]' : 'text-slate-400'} />
              <span>Renovaciones</span>
            </div>
            {activeModule === 'renovaciones' && <span className="w-1.5 h-1.5 bg-[#2E5BFF] rounded-full shadow-[0_0_8px_#2E5BFF]" />}
          </button>

          {/* Tareas (ENABLED) */}
          <button
            id="nav-tareas"
            onClick={() => setActiveModule('tareas')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
              activeModule === 'tareas'
                ? 'bg-[#2E5BFF]/10 text-[#2E5BFF] border border-[#2E5BFF]/10 shadow-[0_4px_15px_rgba(46,91,255,0.06)]'
                : 'text-slate-500 hover:text-[#2E5BFF] hover:bg-[#2E5BFF]/5'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CheckSquare size={18} className={activeModule === 'tareas' ? 'text-[#2E5BFF]' : 'text-slate-400'} />
              <span>Tareas</span>
            </div>
            {activeModule === 'tareas' && <span className="w-1.5 h-1.5 bg-[#2E5BFF] rounded-full shadow-[0_0_8px_#2E5BFF]" />}
          </button>
        </nav>

        {/* Company section */}
        {user && (
          <div className="px-4 py-3 border-t border-slate-100/50">
            {(!companyName && !companyLogo) ? (
              <button 
                onClick={() => setIsCompanyModalOpen(true)}
                className="w-full p-2.5 rounded-xl border border-dashed border-slate-200 hover:border-[#2E5BFF]/40 bg-slate-50/50 hover:bg-[#2E5BFF]/5 flex items-center space-x-2.5 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 group-hover:text-[#2E5BFF] group-hover:bg-[#2E5BFF]/10 flex items-center justify-center transition-all shrink-0">
                  <Building2 size={16} />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#2E5BFF] block leading-none transition-all">Agregar Empresa</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 leading-none">Personalizar logo</span>
                </div>
              </button>
            ) : (
              <div className="w-full p-2 rounded-xl bg-slate-50/40 border border-slate-100/80 flex items-center justify-between group">
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  {companyLogo ? (
                    <img 
                      src={companyLogo} 
                      alt="Logo Empresa" 
                      className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200/60 shrink-0" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#2E5BFF]/10 text-[#2E5BFF] flex items-center justify-center font-bold text-xs shrink-0">
                      {companyName ? companyName.charAt(0).toUpperCase() : 'E'}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-700 truncate leading-none">
                      {companyName || 'Mi Empresa'}
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-1 leading-none">Empresa activa</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCompanyModalOpen(true)}
                  className="p-1 text-slate-400 hover:text-[#2E5BFF] hover:bg-[#2E5BFF]/5 rounded-lg transition-all"
                  title="Configurar Empresa"
                >
                  <Settings size={13} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* User profile / Log out */}
        {user && (
          <div className="p-4 border-t border-slate-100/80 bg-transparent flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full border border-slate-200/80 shrink-0" 
                />
              ) : (
                <div className="w-9 h-9 bg-slate-100 text-slate-600 flex items-center justify-center font-bold rounded-full shrink-0">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-700 truncate">
                  {user.displayName || 'Usuario'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="p-2 hover:bg-[#2E5BFF]/5 text-slate-400 hover:text-[#2E5BFF] rounded-lg transition-all"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        
        {/* Workspace Header */}
        <header className="h-16 border-b border-white/40 bg-white/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0 relative z-20">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-extrabold text-slate-800 font-display tracking-tight">
              {activeModule === 'dashboard' ? 'Dashboard' : activeModule === 'clientes' ? 'Clientes' : activeModule === 'prospectos' ? 'Prospectos' : activeModule === 'ventas' ? 'Ventas' : activeModule === 'renovaciones' ? 'Renovaciones' : activeModule === 'tareas' ? 'Tareas' : 'Gastos'}
            </h2>
            
            {/* Sheet sync status pill */}
            {activeModule === 'dashboard' ? (
              <span id="dashboard-sync-badge" className="flex items-center space-x-1.5 px-3 py-1 bg-[#2E5BFF]/5 text-[#2E5BFF] text-xs font-semibold rounded-full border border-[#2E5BFF]/15 shadow-sm">
                <Database size={13} className="text-[#2E5BFF]" />
                <span>Datos Combinados</span>
              </span>
            ) : activeModule === 'clientes' ? (
              spreadsheetId ? (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  id="connected-sheet-badge"
                  className="flex items-center space-x-1.5 px-3 py-1 bg-[#2E5BFF]/5 hover:bg-[#2E5BFF]/10 text-[#2E5BFF] text-xs font-semibold rounded-full border border-[#2E5BFF]/15 transition-all shrink-0 shadow-sm"
                  title="Abrir hoja de Google Sheets en nueva pestaña"
                >
                  <FileSpreadsheet size={13} className="text-[#2E5BFF]" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">Google Sheets: "{spreadsheetName}"</span>
                  <ExternalLink size={10} className="opacity-70" />
                </a>
              ) : (
                !isLoading && (
                  <span id="no-sheet-badge" className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
                    <Database size={13} className="text-amber-500" />
                    <span>Sin sincronizar</span>
                  </span>
                )
              )
            ) : activeModule === 'prospectos' ? (
              prospectosSpreadsheetId ? (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${prospectosSpreadsheetId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  id="connected-prospectos-sheet-badge"
                  className="flex items-center space-x-1.5 px-3 py-1 bg-[#2E5BFF]/5 hover:bg-[#2E5BFF]/10 text-[#2E5BFF] text-xs font-semibold rounded-full border border-[#2E5BFF]/15 transition-all shrink-0 shadow-sm"
                  title="Abrir hoja de Google Sheets de Prospectos en nueva pestaña"
                >
                  <FileSpreadsheet size={13} className="text-[#2E5BFF]" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">Google Sheets: "{prospectosSpreadsheetName || 'Prospectos'}"</span>
                  <ExternalLink size={10} className="opacity-70" />
                </a>
              ) : (
                !isLoading && (
                  <span id="no-prospectos-sheet-badge" className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
                    <Database size={13} className="text-amber-500" />
                    <span>Sin sincronizar</span>
                  </span>
                )
              )
            ) : activeModule === 'ventas' ? (
              ventasSpreadsheetId ? (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${ventasSpreadsheetId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  id="connected-ventas-sheet-badge"
                  className="flex items-center space-x-1.5 px-3 py-1 bg-[#2E5BFF]/5 hover:bg-[#2E5BFF]/10 text-[#2E5BFF] text-xs font-semibold rounded-full border border-[#2E5BFF]/15 transition-all shrink-0 shadow-sm"
                  title="Abrir hoja de Google Sheets de Ventas en nueva pestaña"
                >
                  <FileSpreadsheet size={13} className="text-[#2E5BFF]" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">Google Sheets: "{ventasSpreadsheetName || 'Ventas'}"</span>
                  <ExternalLink size={10} className="opacity-70" />
                </a>
              ) : (
                !isLoading && (
                  <span id="no-ventas-sheet-badge" className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
                    <Database size={13} className="text-amber-500" />
                    <span>Sin sincronizar</span>
                  </span>
                )
              )
            ) : activeModule === 'renovaciones' ? (
              renovacionesSpreadsheetId ? (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${renovacionesSpreadsheetId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  id="connected-renovaciones-sheet-badge"
                  className="flex items-center space-x-1.5 px-3 py-1 bg-[#2E5BFF]/5 hover:bg-[#2E5BFF]/10 text-[#2E5BFF] text-xs font-semibold rounded-full border border-[#2E5BFF]/15 transition-all shrink-0 shadow-sm"
                  title="Abrir hoja de Google Sheets de Renovaciones en nueva pestaña"
                >
                  <FileSpreadsheet size={13} className="text-[#2E5BFF]" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">Google Sheets: "{renovacionesSpreadsheetName || 'Renovaciones'}"</span>
                  <ExternalLink size={10} className="opacity-70" />
                </a>
              ) : (
                !isLoading && (
                  <span id="no-renovaciones-sheet-badge" className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
                    <Database size={13} className="text-amber-500" />
                    <span>Sin sincronizar</span>
                  </span>
                )
              )
            ) : activeModule === 'gastos' ? (
              gastosSpreadsheetId ? (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${gastosSpreadsheetId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  id="connected-gastos-sheet-badge"
                  className="flex items-center space-x-1.5 px-3 py-1 bg-[#2E5BFF]/5 hover:bg-[#2E5BFF]/10 text-[#2E5BFF] text-xs font-semibold rounded-full border border-[#2E5BFF]/15 transition-all shrink-0 shadow-sm"
                  title="Abrir hoja de Google Sheets de Gastos en nueva pestaña"
                >
                  <FileSpreadsheet size={13} className="text-[#2E5BFF]" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">Google Sheets: "{gastosSpreadsheetName || 'Gastos'}"</span>
                  <ExternalLink size={10} className="opacity-70" />
                </a>
              ) : (
                !isLoading && (
                  <span id="no-gastos-sheet-badge" className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
                    <Database size={13} className="text-amber-500" />
                    <span>Sin sincronizar</span>
                  </span>
                )
              )
            ) : (
              tareasSpreadsheetId ? (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${tareasSpreadsheetId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  id="connected-tareas-sheet-badge"
                  className="flex items-center space-x-1.5 px-3 py-1 bg-[#2E5BFF]/5 hover:bg-[#2E5BFF]/10 text-[#2E5BFF] text-xs font-semibold rounded-full border border-[#2E5BFF]/15 transition-all shrink-0 shadow-sm"
                  title="Abrir hoja de Google Sheets de Tareas en nueva pestaña"
                >
                  <FileSpreadsheet size={13} className="text-[#2E5BFF]" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">Google Sheets: "{tareasSpreadsheetName || 'Tareas'}"</span>
                  <ExternalLink size={10} className="opacity-70" />
                </a>
              ) : (
                !isLoading && (
                  <span id="no-tareas-sheet-badge" className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
                    <Database size={13} className="text-amber-500" />
                    <span>Sin sincronizar</span>
                  </span>
                )
              )
            )}
          </div>

          <div className="flex items-center space-x-2">
            {(activeModule === 'dashboard' ||
              (activeModule === 'clientes' && spreadsheetId) || 
              (activeModule === 'prospectos' && prospectosSpreadsheetId) || 
              (activeModule === 'ventas' && ventasSpreadsheetId) ||
              (activeModule === 'gastos' && gastosSpreadsheetId) ||
              (activeModule === 'renovaciones' && renovacionesSpreadsheetId) ||
              (activeModule === 'tareas' && tareasSpreadsheetId)) && (
              <button
                id="refresh-data-btn"
                onClick={() => loadSpreadsheetData(token!)}
                disabled={isLoading}
                className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all"
                title="Actualizar datos manualmente"
              >
                <RefreshCw size={16} className={`${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </header>

        {/* Workspace Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {error && (
            <div id="workspace-error" className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm flex items-start space-x-3 shadow-sm">
              <AlertCircle className="shrink-0 mt-0.5 text-rose-500" size={18} />
              <div className="flex-1">
                <p className="font-semibold">Atención</p>
                <p className="opacity-90">{error}</p>
                <button
                  onClick={() => token && loadSpreadsheetData(token)}
                  className="mt-2 text-xs font-bold text-rose-800 hover:underline flex items-center space-x-1"
                >
                  <span>Reintentar conexión</span>
                </button>
              </div>
            </div>
          )}

          {/* Conditional Layout based on Sheet connection */}
          {activeModule === 'clientes' && !spreadsheetId ? (
            /* SPREADSHEET DISCOVERY BANNER (WIZARD) FOR CLIENTES */
            <div 
              id="sheet-wizard-card"
              className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 flex flex-col items-center text-center animate-in fade-in-50 duration-300"
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-5">
                <FileSpreadsheet size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-display">Conectar Base de Datos de Clientes</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
                Para empezar a gestionar tus clientes, necesitamos leer y escribir en tu cuenta de Google Drive. Buscaremos una hoja de cálculo llamada <strong>"Clientes"</strong>, y si no existe, la crearemos por ti.
              </p>

              {isLoading ? (
                <div className="mt-8 flex flex-col items-center space-y-3">
                  <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-medium text-slate-500">Buscando hoja en Google Drive...</span>
                </div>
              ) : (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    id="find-sheet-btn"
                    onClick={() => loadSpreadsheetData(token!)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all"
                  >
                    Buscar Hoja "Clientes"
                  </button>
                  <button
                    id="create-sheet-btn"
                    onClick={handleCreateSheet}
                    disabled={isCreatingSheet}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-emerald-600/10 flex items-center justify-center min-w-[180px]"
                  >
                    {isCreatingSheet ? 'Creando Hoja...' : 'Crear Nueva Hoja "Clientes"'}
                  </button>
                </div>
              )}
            </div>
          ) : activeModule === 'prospectos' && !prospectosSpreadsheetId ? (
            /* SPREADSHEET DISCOVERY BANNER (WIZARD) FOR PROSPECTOS */
            <div 
              id="prospectos-sheet-wizard-card"
              className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 flex flex-col items-center text-center animate-in fade-in-50 duration-300"
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-5">
                <FileSpreadsheet size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-display">Conectar Base de Datos de Prospectos</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
                Para empezar a gestionar tus prospectos, necesitamos una hoja de cálculo dedicada llamada <strong>"Prospectos"</strong> en tu cuenta de Google Drive. Si no existe, la crearemos por ti.
              </p>

              {isLoading ? (
                <div className="mt-8 flex flex-col items-center space-y-3">
                  <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-medium text-slate-500">Buscando hoja en Google Drive...</span>
                </div>
              ) : (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    id="find-prospectos-sheet-btn"
                    onClick={() => loadSpreadsheetData(token!)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all"
                  >
                    Buscar Hoja "Prospectos"
                  </button>
                  <button
                    id="create-prospectos-sheet-btn"
                    onClick={handleCreateProspectosSheet}
                    disabled={isCreatingSheet}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-emerald-600/10 flex items-center justify-center min-w-[200px]"
                  >
                    {isCreatingSheet ? 'Creando Hoja...' : 'Crear Nueva Hoja "Prospectos"'}
                  </button>
                </div>
              )}
            </div>
          ) : activeModule === 'ventas' && !ventasSpreadsheetId ? (
            /* SPREADSHEET DISCOVERY BANNER (WIZARD) FOR VENTAS */
            <div 
              id="ventas-sheet-wizard-card"
              className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 flex flex-col items-center text-center animate-in fade-in-50 duration-300"
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-5">
                <FileSpreadsheet size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-display">Conectar Base de Datos de Ventas</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
                Para empezar a gestionar tus ventas, necesitamos una hoja de cálculo dedicada llamada <strong>"Ventas"</strong> en tu cuenta de Google Drive. Si no existe, la crearemos por ti.
              </p>

              {isLoading ? (
                <div className="mt-8 flex flex-col items-center space-y-3">
                  <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-medium text-slate-500">Buscando hoja en Google Drive...</span>
                </div>
              ) : (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    id="find-ventas-sheet-btn"
                    onClick={() => loadSpreadsheetData(token!)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all"
                  >
                    Buscar Hoja "Ventas"
                  </button>
                  <button
                    id="create-ventas-sheet-btn"
                    onClick={handleCreateVentasSheet}
                    disabled={isCreatingSheet}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-emerald-600/10 flex items-center justify-center min-w-[200px]"
                  >
                    {isCreatingSheet ? 'Creando Hoja...' : 'Crear Nueva Hoja "Ventas"'}
                  </button>
                </div>
              )}
            </div>
          ) : activeModule === 'gastos' && !gastosSpreadsheetId ? (
            /* SPREADSHEET DISCOVERY BANNER (WIZARD) FOR GASTOS */
            <div 
              id="gastos-sheet-wizard-card"
              className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 flex flex-col items-center text-center animate-in fade-in-50 duration-300"
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-5">
                <FileSpreadsheet size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-display">Conectar Base de Datos de Gastos</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
                Para empezar a gestionar tus gastos, necesitamos una hoja de cálculo dedicada llamada <strong>"Gastos"</strong> en tu cuenta de Google Drive. Si no existe, la crearemos por ti.
              </p>

              {isLoading ? (
                <div className="mt-8 flex flex-col items-center space-y-3">
                  <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-medium text-slate-500">Buscando hoja en Google Drive...</span>
                </div>
              ) : (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    id="find-gastos-sheet-btn"
                    onClick={() => loadSpreadsheetData(token!)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all"
                  >
                    Buscar Hoja "Gastos"
                  </button>
                  <button
                    id="create-gastos-sheet-btn"
                    onClick={handleCreateGastosSheet}
                    disabled={isCreatingSheet}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-emerald-600/10 flex items-center justify-center min-w-[200px]"
                  >
                    {isCreatingSheet ? 'Creando Hoja...' : 'Crear Nueva Hoja "Gastos"'}
                  </button>
                </div>
              )}
            </div>
          ) : activeModule === 'renovaciones' && !renovacionesSpreadsheetId ? (
            /* SPREADSHEET DISCOVERY BANNER (WIZARD) FOR RENOVACIONES */
            <div 
              id="renovaciones-sheet-wizard-card"
              className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 flex flex-col items-center text-center animate-in fade-in-50 duration-300"
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-5">
                <FileSpreadsheet size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-display">Conectar Base de Datos de Renovaciones</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
                Para empezar a gestionar tus renovaciones, necesitamos una hoja de cálculo dedicada llamada <strong>"Renovaciones"</strong> en tu cuenta de Google Drive. Si no existe, la crearemos por ti.
              </p>

              {isLoading ? (
                <div className="mt-8 flex flex-col items-center space-y-3">
                  <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-medium text-slate-500">Buscando hoja en Google Drive...</span>
                </div>
              ) : (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    id="find-renovaciones-sheet-btn"
                    onClick={() => loadSpreadsheetData(token!)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all"
                  >
                    Buscar Hoja "Renovaciones"
                  </button>
                  <button
                    id="create-renovaciones-sheet-btn"
                    onClick={handleCreateRenovacionesSheet}
                    disabled={isCreatingSheet}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-emerald-600/10 flex items-center justify-center min-w-[200px]"
                  >
                    {isCreatingSheet ? 'Creando Hoja...' : 'Crear Nueva Hoja "Renovaciones"'}
                  </button>
                </div>
              )}
            </div>
          ) : activeModule === 'tareas' && !tareasSpreadsheetId ? (
            /* SPREADSHEET DISCOVERY BANNER (WIZARD) FOR TAREAS */
            <div 
              id="tareas-sheet-wizard-card"
              className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 flex flex-col items-center text-center animate-in fade-in-50 duration-300"
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-5">
                <FileSpreadsheet size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-display">Conectar Base de Datos de Tareas</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
                Para empezar a gestionar tus tareas, necesitamos una hoja de cálculo dedicada llamada <strong>"Tareas"</strong> en tu Google Drive. Si no existe, la crearemos por ti.
              </p>

              {isLoading ? (
                <div className="mt-8 flex flex-col items-center space-y-3">
                  <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-medium text-slate-500">Buscando hoja en Google Drive...</span>
                </div>
              ) : (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    id="find-tareas-sheet-btn"
                    onClick={() => loadSpreadsheetData(token!)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all"
                  >
                    Buscar Hoja "Tareas"
                  </button>
                  <button
                    id="create-tareas-sheet-btn"
                    onClick={handleCreateTareasSheet}
                    disabled={isCreatingSheet}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-emerald-600/10 flex items-center justify-center min-w-[200px]"
                  >
                    {isCreatingSheet ? 'Creando Hoja...' : 'Crear Nueva Hoja "Tareas"'}
                  </button>
                </div>
              )}
            </div>
          ) : activeModule === 'dashboard' ? (
            <Dashboard
              clientes={clientes}
              prospectos={prospectos}
              ventas={ventas}
              gastos={gastos}
              renovaciones={renovaciones}
              tareas={tareas}
            />
          ) : activeModule === 'clientes' ? (
            /* FULL CLIENTES WORKSPACE (ACTIVE STATE) */
            <div className="animate-in fade-in duration-200">
              
              {/* Metric KPI Cards */}
              <MetricCards clientes={clientes} />

              {/* Data controls & filters bar */}
              <div 
                id="search-filter-controls"
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center mb-6"
              >
                {/* Left Side: Search and Status filter */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 flex-1 max-w-2xl">
                  {/* Search bar */}
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Search size={18} />
                    </span>
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Buscar por Empresa, Contacto, Servicio..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Status dropdown */}
                  <div className="w-full sm:w-48 shrink-0">
                    <select
                      id="status-filter"
                      value={estadoFilter}
                      onChange={(e) => setEstadoFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-600 bg-white"
                    >
                      <option value="Todos">📂 Todos los estados</option>
                      <option value="Activo">🟢 Activo</option>
                      <option value="Inactivo">🔴 Inactivo</option>
                      <option value="Vencido">⚠️ Vencido</option>
                      <option value="Pendiente">🟡 Pendiente</option>
                    </select>
                  </div>
                </div>

                {/* Right Side: Export to Excel and Add client buttons */}
                <div className="w-full sm:w-auto flex items-center gap-2.5 justify-end shrink-0">
                  <button
                    id="export-excel-btn"
                    onClick={handleExport}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
                    title="Exportar registros filtrados a CSV para Excel"
                  >
                    <Download size={16} />
                    <span>Exportar a Excel</span>
                  </button>

                  <button
                    id="add-cliente-btn"
                    onClick={handleOpenAddForm}
                    className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Agregar Cliente</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div 
                id="clientes-table-container"
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center space-y-4">
                    <svg className="animate-spin h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Actualizando datos de clientes...</span>
                  </div>
                ) : filteredClientes.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center">
                    <Users size={48} className="text-slate-300 mb-4" />
                    <h4 className="text-lg font-bold text-slate-700 font-display">Sin Resultados</h4>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm leading-relaxed">
                      {searchQuery || estadoFilter !== 'Todos'
                        ? 'No se encontraron clientes que coincidan con los filtros de búsqueda actuales.'
                        : 'No hay clientes registrados en la hoja de Sheets. Comienza agregando uno nuevo.'}
                    </p>
                    {(searchQuery || estadoFilter !== 'Todos') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setEstadoFilter('Todos');
                        }}
                        className="mt-4 px-4 py-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4 font-mono">ID</th>
                          <th className="py-3 px-4">Empresa</th>
                          <th className="py-3 px-4">Contacto</th>
                          <th className="py-3 px-4">Teléfono</th>
                          <th className="py-3 px-4">Correo</th>
                          <th className="py-3 px-4">Servicio</th>
                          <th className="py-3 px-4">Valor</th>
                          <th className="py-3 px-4">F. Inicio</th>
                          <th className="py-3 px-4">F. Vence</th>
                          <th className="py-3 px-4 text-center">Estado</th>
                          <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {filteredClientes.map((cliente) => (
                          <tr 
                            key={cliente.id}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="py-3 px-4 font-mono font-medium text-xs text-slate-400">
                              {cliente.id}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {cliente.empresa}
                            </td>
                            <td className="py-3 px-4">
                              {cliente.contacto}
                            </td>
                            <td className="py-3 px-4 text-xs font-medium text-slate-500 truncate max-w-[120px]">
                              {cliente.telefono || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 truncate max-w-[150px]" title={cliente.correo}>
                              {cliente.correo || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs">
                              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                                {cliente.servicio || 'General'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-medium text-xs text-slate-600">
                              {cliente.valor || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {cliente.fechaInicio || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {cliente.fechaVencimiento || '—'}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                cliente.estado === 'Activo'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : cliente.estado === 'Inactivo'
                                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                                  : cliente.estado === 'Vencido'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                  : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  cliente.estado === 'Activo'
                                    ? 'bg-emerald-500'
                                    : cliente.estado === 'Inactivo'
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                                }`} />
                                {cliente.estado}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditForm(cliente)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                                  title="Editar Cliente"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => handleRequestDelete(cliente)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Eliminar Cliente"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!isLoading && (
                  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Mostrando {filteredClientes.length} de {clientes.length} clientes
                    </span>
                    <span className="font-mono text-[10px]">
                      Sincronizado con Sheets en tiempo real
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : activeModule === 'prospectos' ? (
            /* FULL PROSPECTOS WORKSPACE (ACTIVE STATE) */
            <div className="animate-in fade-in duration-200">
              
              {/* Metric KPI Cards */}
              <ProspectoMetricCards prospectos={prospectos} />

              {/* Data controls & filters bar */}
              <div 
                id="prospectos-search-filter-controls"
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center mb-6"
              >
                {/* Left Side: Search and Status filter */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 flex-1 max-w-2xl">
                  {/* Search bar */}
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Search size={18} />
                    </span>
                    <input
                      id="prospectos-search-input"
                      type="text"
                      placeholder="Buscar por Empresa, Contacto, Servicio..."
                      value={prospectosSearchQuery}
                      onChange={(e) => setProspectosSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    />
                    {prospectosSearchQuery && (
                      <button
                        onClick={() => setProspectosSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Status dropdown */}
                  <div className="w-full sm:w-48 shrink-0">
                    <select
                      id="prospectos-status-filter"
                      value={prospectosEstadoFilter}
                      onChange={(e) => setProspectosEstadoFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-600 bg-white"
                    >
                      <option value="Todos">📂 Todos los estados</option>
                      <option value="Nuevo">🔵 Nuevo</option>
                      <option value="Contactado">🟡 Contactado</option>
                      <option value="En negociación">🟠 En negociación</option>
                      <option value="Propuesta enviada">🟣 Propuesta enviada</option>
                      <option value="Ganado">🟢 Ganado</option>
                      <option value="Perdido">🔴 Perdido</option>
                    </select>
                  </div>
                </div>

                {/* Right Side: Export and Add prospecto buttons */}
                <div className="w-full sm:w-auto flex items-center gap-2.5 justify-end shrink-0">
                  <button
                    id="prospectos-export-excel-btn"
                    onClick={handleExportProspectos}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
                    title="Exportar registros filtrados a CSV para Excel"
                  >
                    <Download size={16} />
                    <span>Exportar a Excel</span>
                  </button>

                  <button
                    id="add-prospecto-btn"
                    onClick={handleOpenAddProspectoForm}
                    className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Agregar Prospecto</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div 
                id="prospectos-table-container"
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center space-y-4">
                    <svg className="animate-spin h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Actualizando datos de prospectos...</span>
                  </div>
                ) : filteredProspectos.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center">
                    <Layers size={48} className="text-slate-300 mb-4" />
                    <h4 className="text-lg font-bold text-slate-700 font-display">Sin Resultados</h4>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm leading-relaxed">
                      {prospectosSearchQuery || prospectosEstadoFilter !== 'Todos'
                        ? 'No se encontraron prospectos que coincidan con los filtros de búsqueda actuales.'
                        : 'No hay prospectos registrados en la hoja de Sheets. Comienza agregando uno nuevo.'}
                    </p>
                    {(prospectosSearchQuery || prospectosEstadoFilter !== 'Todos') && (
                      <button
                        onClick={() => {
                          setProspectosSearchQuery('');
                          setProspectosEstadoFilter('Todos');
                        }}
                        className="mt-4 px-4 py-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4 font-mono">ID</th>
                          <th className="py-3 px-4">Empresa</th>
                          <th className="py-3 px-4">Contacto</th>
                          <th className="py-3 px-4">Teléfono</th>
                          <th className="py-3 px-4">Correo</th>
                          <th className="py-3 px-4">Servicio de interés</th>
                          <th className="py-3 px-4">Valor Estimado</th>
                          <th className="py-3 px-4">Último contacto</th>
                          <th className="py-3 px-4">Próximo seg.</th>
                          <th className="py-3 px-4 text-center">Estado</th>
                          <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {filteredProspectos.map((p) => (
                          <tr 
                            key={p.id}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="py-3 px-4 font-mono font-medium text-xs text-slate-400">
                              {p.id}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {p.empresa}
                            </td>
                            <td className="py-3 px-4">
                              {p.contacto}
                            </td>
                            <td className="py-3 px-4 text-xs font-medium text-slate-500 truncate max-w-[120px]">
                              {p.telefono || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 truncate max-w-[150px]" title={p.correo}>
                              {p.correo || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs">
                              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                                {p.servicioInteres || 'General'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-medium text-xs text-slate-600">
                              {p.valorEstimado || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {p.ultimoContacto || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {p.proximoSeguimiento || '—'}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                p.estado === 'Nuevo'
                                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                                  : p.estado === 'Contactado'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : p.estado === 'En negociación'
                                  ? 'bg-orange-50 text-orange-700 border-orange-100'
                                  : p.estado === 'Propuesta enviada'
                                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                                  : p.estado === 'Ganado'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-100' // Perdido
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  p.estado === 'Nuevo'
                                    ? 'bg-blue-500'
                                    : p.estado === 'Contactado'
                                    ? 'bg-amber-500'
                                    : p.estado === 'En negociación'
                                    ? 'bg-orange-500'
                                    : p.estado === 'Propuesta enviada'
                                    ? 'bg-purple-500'
                                    : p.estado === 'Ganado'
                                    ? 'bg-emerald-500'
                                    : 'bg-rose-500'
                                }`} />
                                {p.estado}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditProspectoForm(p)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                                  title="Editar Prospecto"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => handleRequestProspectoDelete(p)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Eliminar Prospecto"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!isLoading && (
                  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Mostrando {filteredProspectos.length} de {prospectos.length} prospectos
                    </span>
                    <span className="font-mono text-[10px]">
                      Sincronizado con Sheets en tiempo real
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : activeModule === 'ventas' ? (
            /* FULL VENTAS WORKSPACE (ACTIVE STATE) */
            <div className="animate-in fade-in duration-200">
              
              {/* Metric KPI Cards */}
              <VentaMetricCards ventas={ventas} />

              {/* Data controls & filters bar */}
              <div 
                id="ventas-search-filter-controls"
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center mb-6"
              >
                {/* Left Side: Search, Status filter, and Date filters */}
                <div className="w-full xl:w-auto flex flex-col md:flex-row items-center gap-3 flex-1 max-w-5xl">
                  {/* Search bar */}
                  <div className="relative w-full md:w-72 shrink-0">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Search size={18} />
                    </span>
                    <input
                      id="ventas-search-input"
                      type="text"
                      placeholder="Buscar por Cliente, Servicio..."
                      value={ventasSearchQuery}
                      onChange={(e) => setVentasSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    />
                    {ventasSearchQuery && (
                      <button
                        onClick={() => setVentasSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Status dropdown */}
                  <div className="w-full md:w-48 shrink-0">
                    <select
                      id="ventas-status-filter"
                      value={ventasEstadoFilter}
                      onChange={(e) => setVentasEstadoFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-600 bg-white"
                    >
                      <option value="Todos">💵 Todos los pagos</option>
                      <option value="Pagado">🟢 Pagado</option>
                      <option value="Pendiente">🟡 Pendiente</option>
                      <option value="Vencido">🔴 Vencido</option>
                    </select>
                  </div>

                  {/* Date Filters ("Filtrar por fecha") */}
                  <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                    <div className="w-full relative flex items-center">
                      <span className="absolute left-3 text-[10px] uppercase font-bold text-slate-400">Desde</span>
                      <input
                        type="date"
                        id="ventas-fecha-desde"
                        value={ventasFechaDesde}
                        onChange={(e) => setVentasFechaDesde(e.target.value)}
                        className="w-full pl-14 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div className="w-full relative flex items-center">
                      <span className="absolute left-3 text-[10px] uppercase font-bold text-slate-400">Hasta</span>
                      <input
                        type="date"
                        id="ventas-fecha-hasta"
                        value={ventasFechaHasta}
                        onChange={(e) => setVentasFechaHasta(e.target.value)}
                        className="w-full pl-14 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    {(ventasFechaDesde || ventasFechaHasta) && (
                      <button
                        onClick={() => {
                          setVentasFechaDesde('');
                          setVentasFechaHasta('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        title="Limpiar fechas"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side: Export and Add venta buttons */}
                <div className="w-full xl:w-auto flex items-center gap-2.5 justify-end shrink-0">
                  <button
                    id="ventas-export-excel-btn"
                    onClick={handleExportVentas}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
                    title="Exportar registros filtrados a CSV para Excel"
                  >
                    <Download size={16} />
                    <span>Exportar a Excel</span>
                  </button>

                  <button
                    id="add-venta-btn"
                    onClick={handleOpenAddVentaForm}
                    className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Registrar Venta</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div 
                id="ventas-table-container"
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center space-y-4">
                    <svg className="animate-spin h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Actualizando datos de ventas...</span>
                  </div>
                ) : filteredVentas.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center">
                    <TrendingUp size={48} className="text-slate-300 mb-4" />
                    <h4 className="text-lg font-bold text-slate-700 font-display">Sin Resultados</h4>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm leading-relaxed">
                      {ventasSearchQuery || ventasEstadoFilter !== 'Todos' || ventasFechaDesde || ventasFechaHasta
                        ? 'No se encontraron registros de ventas que coincidan con los filtros actuales.'
                        : 'No hay ventas registradas en la hoja de Sheets. Comienza registrando una nueva.'}
                    </p>
                    {(ventasSearchQuery || ventasEstadoFilter !== 'Todos' || ventasFechaDesde || ventasFechaHasta) && (
                      <button
                        onClick={() => {
                          setVentasSearchQuery('');
                          setVentasEstadoFilter('Todos');
                          setVentasFechaDesde('');
                          setVentasFechaHasta('');
                        }}
                        className="mt-4 px-4 py-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4 font-mono">ID</th>
                          <th className="py-3 px-4">Cliente</th>
                          <th className="py-3 px-4">Servicio</th>
                          <th className="py-3 px-4">Valor</th>
                          <th className="py-3 px-4">Fecha Venta</th>
                          <th className="py-3 px-4 text-center">Estado de pago</th>
                          <th className="py-3 px-4">F. Inicio</th>
                          <th className="py-3 px-4">F. Renovación</th>
                          <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {filteredVentas.map((v) => (
                          <tr 
                            key={v.id}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="py-3 px-4 font-mono font-medium text-xs text-slate-400">
                              {v.id}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {v.cliente}
                            </td>
                            <td className="py-3 px-4 text-xs">
                              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                                {v.servicio || 'General'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-xs text-slate-700">
                              {v.valor || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {v.fecha || '—'}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                v.estadoPago === 'Pagado'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : v.estadoPago === 'Pendiente'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                                  : 'bg-rose-50 text-rose-700 border-rose-100' // Vencido
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  v.estadoPago === 'Pagado'
                                    ? 'bg-emerald-500'
                                    : v.estadoPago === 'Pendiente'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`} />
                                {v.estadoPago}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {v.fechaInicio || '—'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {v.fechaRenovacion || '—'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditVentaForm(v)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                                  title="Editar Venta"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => handleRequestVentaDelete(v)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Eliminar Venta"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!isLoading && (
                  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Mostrando {filteredVentas.length} de {ventas.length} registros de ventas
                    </span>
                    <span className="font-mono text-[10px]">
                      Sincronizado con Sheets en tiempo real
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : activeModule === 'renovaciones' ? (
            /* FULL RENOVACIONES WORKSPACE (ACTIVE STATE) */
            <div className="animate-in fade-in duration-200">
              
              {/* Metric KPI Cards */}
              <RenovacionMetricCards renovaciones={renovaciones} />

              {/* Data controls & filters bar */}
              <div 
                id="renovaciones-search-filter-controls"
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center mb-6"
              >
                {/* Left Side: Search and filters */}
                <div className="w-full xl:w-auto flex flex-col md:flex-row items-center gap-3 flex-1 max-w-4xl">
                  {/* Search bar */}
                  <div className="relative w-full md:flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Search size={18} />
                    </span>
                    <input
                      id="renovaciones-search-input"
                      type="text"
                      placeholder="Buscar por Cliente, Servicio o ID..."
                      value={renovacionesSearchQuery}
                      onChange={(e) => setRenovacionesSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    />
                    {renovacionesSearchQuery && (
                      <button
                        onClick={() => setRenovacionesSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Estado filter */}
                  <div className="w-full md:w-48 shrink-0">
                    <select
                      id="renovaciones-estado-filter"
                      value={renovacionesEstadoFilter}
                      onChange={(e) => setRenovacionesEstadoFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-600 bg-white"
                    >
                      <option value="Todos">📊 Estado: Todos</option>
                      <option value="Activo">🟢 Activo</option>
                      <option value="Pendiente">🟡 Pendiente</option>
                      <option value="Vencido">🔴 Vencido</option>
                    </select>
                  </div>
                </div>

                {/* Right Side: Export to Excel and Add buttons */}
                <div className="w-full xl:w-auto flex items-center gap-2.5 justify-end shrink-0">
                  <button
                    id="renovaciones-export-excel-btn"
                    onClick={handleExportRenovaciones}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
                    title="Exportar registros filtrados a CSV para Excel"
                  >
                    <Download size={16} />
                    <span>Exportar a Excel</span>
                  </button>

                  <button
                    id="add-renovacion-btn"
                    onClick={handleOpenAddRenovacionForm}
                    className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Nueva Renovación</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div 
                id="renovaciones-table-container"
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center space-y-4">
                    <svg className="animate-spin h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Actualizando datos de renovaciones...</span>
                  </div>
                ) : filteredRenovaciones.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center">
                    <Calendar size={48} className="text-slate-300 mb-4" />
                    <h4 className="text-lg font-bold text-slate-700 font-display">Sin Resultados</h4>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm leading-relaxed">
                      {renovacionesSearchQuery || renovacionesEstadoFilter !== 'Todos'
                        ? 'No se encontraron registros de renovaciones que coincidan con los filtros actuales.'
                        : 'No hay renovaciones registradas en la hoja de Sheets. Comienza creando una nueva.'}
                    </p>
                    {(renovacionesSearchQuery || renovacionesEstadoFilter !== 'Todos') && (
                      <button
                        onClick={() => {
                          setRenovacionesSearchQuery('');
                          setRenovacionesEstadoFilter('Todos');
                        }}
                        className="mt-4 px-4 py-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4 font-mono">ID</th>
                          <th className="py-3 px-4">Cliente</th>
                          <th className="py-3 px-4">Servicio</th>
                          <th className="py-3 px-4">Fecha Renovación</th>
                          <th className="py-3 px-4">Días restantes</th>
                          <th className="py-3 px-4">Valor</th>
                          <th className="py-3 px-4 text-center">Estado</th>
                          <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {filteredRenovaciones.map((r) => {
                          // Calculate days remaining
                          const parts = r.fechaRenovacion.split('-');
                          const renewalDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const diffTime = renewalDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                          let daysLabel = `${diffDays} días`;
                          let daysClass = 'text-slate-600 bg-slate-100';

                          if (diffDays < 0) {
                            daysLabel = `Vencido hace ${Math.abs(diffDays)} días`;
                            daysClass = 'text-rose-700 bg-rose-50 font-semibold';
                          } else if (diffDays === 0) {
                            daysLabel = 'Vence hoy';
                            daysClass = 'text-amber-700 bg-amber-50 font-semibold';
                          } else if (diffDays <= 15) {
                            daysLabel = `${diffDays} días (Próximo)`;
                            daysClass = 'text-amber-700 bg-amber-50 font-medium';
                          } else {
                            daysClass = 'text-emerald-700 bg-emerald-50';
                          }

                          return (
                            <tr 
                              key={r.id}
                              className="hover:bg-slate-50/50 transition-colors group"
                            >
                              <td className="py-3 px-4 font-mono font-medium text-xs text-slate-400">
                                {r.id}
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-900">
                                {r.cliente}
                              </td>
                              <td className="py-3 px-4 text-xs font-medium text-slate-600">
                                {r.servicio}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                                {r.fechaRenovacion}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${daysClass}`}>
                                  {daysLabel}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono font-semibold text-xs text-slate-700">
                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(r.valor) || 0)}
                              </td>
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  r.estado === 'Activo'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : r.estado === 'Pendiente'
                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-100' // Vencido
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    r.estado === 'Activo'
                                      ? 'bg-emerald-500'
                                      : r.estado === 'Pendiente'
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`} />
                                  {r.estado}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => setSelectedRenovacionForReminder(r)}
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    title="Enviar recordatorio"
                                  >
                                    <Bell size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditRenovacionForm(r)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                                    title="Editar Renovación"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleRequestRenovacionDelete(r)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    title="Eliminar Renovación"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {!isLoading && (
                  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Mostrando {filteredRenovaciones.length} de {renovaciones.length} renovaciones
                    </span>
                    <span className="font-mono text-[10px]">
                      Sincronizado con Sheets en tiempo real
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : activeModule === 'tareas' ? (
            /* FULL TAREAS WORKSPACE (ACTIVE STATE) */
            <div className="animate-in fade-in duration-200">
              
              {/* Metric KPI Cards */}
              <TareaMetricCards tareas={tareas} />

              {/* Data controls & filters bar */}
              <div 
                id="tareas-search-filter-controls"
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center mb-6"
              >
                {/* Left Side: Search and filters */}
                <div className="w-full xl:w-auto flex flex-col md:flex-row items-center gap-3 flex-1 max-w-4xl">
                  {/* Search bar */}
                  <div className="relative w-full md:flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Search size={18} />
                    </span>
                    <input
                      id="tareas-search-input"
                      type="text"
                      placeholder="Buscar por Título, Descripción o ID..."
                      value={tareasSearchQuery}
                      onChange={(e) => setTareasSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    />
                    {tareasSearchQuery && (
                      <button
                        onClick={() => setTareasSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Prioridad filter */}
                  <div className="w-full md:w-48 shrink-0">
                    <select
                      id="tareas-prioridad-filter"
                      value={tareasPrioridadFilter}
                      onChange={(e) => setTareasPrioridadFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-600 bg-white"
                    >
                      <option value="Todos">🔥 Prioridad: Todas</option>
                      <option value="Alta">🔴 Alta</option>
                      <option value="Media">🟡 Media</option>
                      <option value="Baja">🔵 Baja</option>
                    </select>
                  </div>

                  {/* Estado filter */}
                  <div className="w-full md:w-48 shrink-0">
                    <select
                      id="tareas-estado-filter"
                      value={tareasEstadoFilter}
                      onChange={(e) => setTareasEstadoFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-600 bg-white"
                    >
                      <option value="Todos">📊 Estado: Todos</option>
                      <option value="Pendiente">⏳ Pendiente</option>
                      <option value="Completada">✅ Completada</option>
                    </select>
                  </div>
                </div>

                {/* Right Side: Export to Excel and Add buttons */}
                <div className="w-full xl:w-auto flex items-center gap-2.5 justify-end shrink-0">
                  <button
                    id="tareas-export-excel-btn"
                    onClick={handleExportTareas}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
                    title="Exportar registros filtrados a CSV para Excel"
                  >
                    <Download size={16} />
                    <span>Exportar a Excel</span>
                  </button>

                  <button
                    id="add-tarea-btn"
                    onClick={handleOpenAddTareaForm}
                    className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Nueva Tarea</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div 
                id="tareas-table-container"
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center space-y-4">
                    <svg className="animate-spin h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Actualizando datos de tareas...</span>
                  </div>
                ) : filteredTareas.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center">
                    <CheckSquare size={48} className="text-slate-300 mb-4" />
                    <h4 className="text-lg font-bold text-slate-700 font-display">Sin Resultados</h4>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm leading-relaxed">
                      {tareasSearchQuery || tareasPrioridadFilter !== 'Todos' || tareasEstadoFilter !== 'Todos'
                        ? 'No se encontraron tareas que coincidan con los filtros actuales.'
                        : 'No hay tareas registradas en la hoja de Sheets. Comienza creando una nueva.'}
                    </p>
                    {(tareasSearchQuery || tareasPrioridadFilter !== 'Todos' || tareasEstadoFilter !== 'Todos') && (
                      <button
                        onClick={() => {
                          setTareasSearchQuery('');
                          setTareasPrioridadFilter('Todos');
                          setTareasEstadoFilter('Todos');
                        }}
                        className="mt-4 px-4 py-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4 font-mono w-24">ID</th>
                          <th className="py-3 px-4 w-6"></th>
                          <th className="py-3 px-4">Título</th>
                          <th className="py-3 px-4">Descripción</th>
                          <th className="py-3 px-4">Fecha</th>
                          <th className="py-3 px-4 text-center">Prioridad</th>
                          <th className="py-3 px-4 text-center">Estado</th>
                          <th className="py-3 px-4 text-center">Finalización</th>
                          <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {filteredTareas.map((t) => (
                          <tr 
                            key={t.id}
                            className={`hover:bg-slate-50/50 transition-colors group ${t.estado === 'Completada' ? 'bg-slate-50/20 text-slate-400' : ''}`}
                          >
                            <td className="py-3 px-4 font-mono font-medium text-xs text-slate-400">
                              {t.id}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleTareaStatus(t)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                  t.estado === 'Completada'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                                    : 'border-slate-300 hover:border-emerald-500 text-transparent'
                                }`}
                                title={t.estado === 'Completada' ? "Marcar como pendiente" : "Marcar como completada"}
                              >
                                <Check size={14} className="stroke-[3]" />
                              </button>
                            </td>
                            <td className={`py-3 px-4 font-semibold ${t.estado === 'Completada' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {t.titulo}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate" title={t.descripcion}>
                              {t.descripcion || '—'}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                              {t.fecha || '—'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                                t.prioridad === 'Alta'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                  : t.prioridad === 'Media'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                {t.prioridad}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                t.estado === 'Completada'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  t.estado === 'Completada' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`} />
                                {t.estado}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap text-xs text-slate-500 font-mono">
                              {t.estado === 'Completada' && t.fechaFinalizacion && t.horaFinalizacion ? (
                                <span title="Fecha y Hora de Finalización">
                                  {t.fechaFinalizacion} {t.horaFinalizacion}
                                </span>
                              ) : t.estado === 'Completada' ? (
                                <span className="text-slate-400">—</span>
                              ) : (
                                <span className="text-slate-400 font-sans">Sin completar</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditTareaForm(t)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                                  title="Editar Tarea"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => handleRequestTareaDelete(t)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Eliminar Tarea"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!isLoading && (
                  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Mostrando {filteredTareas.length} de {tareas.length} tareas
                    </span>
                    <span className="font-mono text-[10px]">
                      Sincronizado con Sheets en tiempo real
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* FULL GASTOS WORKSPACE (ACTIVE STATE) */
            <div className="animate-in fade-in duration-200">
              
              {/* Metric KPI Cards */}
              <GastoMetricCards gastos={gastos} />

              {/* Data controls & filters bar */}
              <div 
                id="gastos-search-filter-controls"
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center mb-6"
              >
                {/* Left Side: Search and filters */}
                <div className="w-full xl:w-auto flex flex-col md:flex-row items-center gap-3 flex-1 max-w-4xl">
                  {/* Search bar */}
                  <div className="relative w-full md:flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Search size={18} />
                    </span>
                    <input
                      id="gastos-search-input"
                      type="text"
                      placeholder="Buscar por Categoría, Descripción, ID..."
                      value={gastosSearchQuery}
                      onChange={(e) => setGastosSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    />
                    {gastosSearchQuery && (
                      <button
                        onClick={() => setGastosSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Category filter */}
                  <div className="w-full md:w-48 shrink-0">
                    <select
                      id="gastos-category-filter"
                      value={gastosCategoriaFilter}
                      onChange={(e) => setGastosCategoriaFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-600 bg-white"
                    >
                      <option value="Todos">📂 Categoría: Todas</option>
                      <option value="Marketing">📢 Marketing</option>
                      <option value="Personal">👥 Personal</option>
                      <option value="Tecnología">💻 Tecnología</option>
                      <option value="Servicios Públicos">🔌 Servicios Públicos</option>
                      <option value="Oficina">🏢 Oficina</option>
                      <option value="Otros">📦 Otros</option>
                    </select>
                  </div>

                  {/* Date range filters */}
                  <div className="w-full md:w-auto flex items-center space-x-2 shrink-0">
                    <input
                      type="date"
                      id="gastos-fecha-desde"
                      value={gastosFechaDesde}
                      onChange={(e) => setGastosFechaDesde(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-600 bg-white"
                      title="Fecha desde"
                    />
                    <span className="text-slate-400 text-xs font-semibold">a</span>
                    <input
                      type="date"
                      id="gastos-fecha-hasta"
                      value={gastosFechaHasta}
                      onChange={(e) => setGastosFechaHasta(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-600 bg-white"
                      title="Fecha hasta"
                    />
                    {(gastosFechaDesde || gastosFechaHasta) && (
                      <button
                        onClick={() => {
                          setGastosFechaDesde('');
                          setGastosFechaHasta('');
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                        title="Limpiar fechas"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side: Export to Excel and Add Gasto buttons */}
                <div className="w-full xl:w-auto flex items-center gap-2.5 justify-end shrink-0">
                  <button
                    id="gastos-export-excel-btn"
                    onClick={handleExportGastos}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
                    title="Exportar registros filtrados a CSV para Excel"
                  >
                    <Download size={16} />
                    <span>Exportar a Excel</span>
                  </button>

                  <button
                    id="add-gasto-btn"
                    onClick={handleOpenAddGastoForm}
                    className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Crear Gasto</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div 
                id="gastos-table-container"
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center space-y-4">
                    <svg className="animate-spin h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500">Actualizando datos de gastos...</span>
                  </div>
                ) : filteredGastos.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center">
                    <Receipt size={48} className="text-slate-300 mb-4" />
                    <h4 className="text-lg font-bold text-slate-700 font-display">Sin Resultados</h4>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm leading-relaxed">
                      {gastosSearchQuery || gastosCategoriaFilter !== 'Todos' || gastosFechaDesde || gastosFechaHasta
                        ? 'No se encontraron registros de gastos que coincidan con los filtros actuales.'
                        : 'No hay gastos registrados en la hoja de Sheets. Comienza creando uno nuevo.'}
                    </p>
                    {(gastosSearchQuery || gastosCategoriaFilter !== 'Todos' || gastosFechaDesde || gastosFechaHasta) && (
                      <button
                        onClick={() => {
                          setGastosSearchQuery('');
                          setGastosCategoriaFilter('Todos');
                          setGastosFechaDesde('');
                          setGastosFechaHasta('');
                        }}
                        className="mt-4 px-4 py-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4 font-mono">ID</th>
                          <th className="py-3 px-4">Fecha</th>
                          <th className="py-3 px-4">Categoría</th>
                          <th className="py-3 px-4">Descripción</th>
                          <th className="py-3 px-4">Valor</th>
                          <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {filteredGastos.map((g) => (
                          <tr 
                            key={g.id}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="py-3 px-4 font-mono font-medium text-xs text-slate-400">
                              {g.id}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {g.fecha}
                            </td>
                            <td className="py-3 px-4 text-xs">
                              <span className={`px-2.5 py-1 rounded-lg font-medium border ${
                                g.categoria === 'Marketing'
                                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                                  : g.categoria === 'Personal'
                                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                                  : g.categoria === 'Tecnología'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : g.categoria === 'Servicios Públicos'
                                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                                  : g.categoria === 'Oficina'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {g.categoria}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-900 truncate max-w-md" title={g.descripcion}>
                              {g.descripcion}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-xs text-slate-700">
                              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(g.valor) || 0)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditGastoForm(g)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                                  title="Editar Gasto"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => handleRequestGastoDelete(g)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Eliminar Gasto"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!isLoading && (
                  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Mostrando {filteredGastos.length} de {gastos.length} registros de gastos
                    </span>
                    <span className="font-mono text-[10px]">
                      Sincronizado con Sheets en tiempo real
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Company Settings Modal */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 relative scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2E5BFF]/10 text-[#2E5BFF] flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">Configuración de Empresa</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Personaliza el nombre y logo de tu negocio</p>
                </div>
              </div>
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    localStorage.setItem('companyName', e.target.value);
                  }}
                  placeholder="Ej. Centinela Asesores"
                  className="w-full h-11 px-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#2E5BFF] focus:ring-2 focus:ring-[#2E5BFF]/10 rounded-xl text-sm transition-all outline-none font-medium text-slate-700"
                />
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Logotipo de la Empresa
                </label>
                
                <div className="flex items-center space-x-4">
                  {/* Preview */}
                  <div className="w-16 h-16 rounded-xl border border-slate-200/80 bg-slate-50/40 flex items-center justify-center overflow-hidden shrink-0">
                    {companyLogo ? (
                      <img 
                        src={companyLogo} 
                        alt="Vista previa logo" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <Building2 size={24} className="text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 1.5 * 1024 * 1024) {
                              alert("El tamaño de la imagen debe ser menor a 1.5 MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64String = reader.result as string;
                              setCompanyLogo(base64String);
                              localStorage.setItem('companyLogo', base64String);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="company-logo-input"
                      />
                      <label
                        htmlFor="company-logo-input"
                        className="inline-flex items-center justify-center h-10 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer space-x-2"
                      >
                        <Upload size={14} className="text-slate-400" />
                        <span>Subir imagen</span>
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Soporta PNG, JPG o SVG. Máx 1.5MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6 pt-5 border-t border-slate-100">
              {companyLogo && (
                <button
                  onClick={() => {
                    setCompanyLogo('');
                    localStorage.removeItem('companyLogo');
                  }}
                  className="flex-1 h-11 border border-red-100 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Quitar logotipo
                </button>
              )}
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="flex-1 h-11 bg-[#2E5BFF] hover:bg-[#2E5BFF]/90 text-white text-xs font-bold rounded-xl shadow-md shadow-[#2E5BFF]/10 transition-all cursor-pointer"
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Form Modals */}
      {isFormOpen && (
        <ClienteForm
          clienteInicial={selectedCliente}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedCliente(null);
          }}
          onSave={handleSaveCliente}
          siguienteId={siguienteId}
        />
      )}

      {isProspectosFormOpen && (
        <ProspectoForm
          prospectoInicial={selectedProspecto}
          onClose={() => {
            setIsProspectosFormOpen(false);
            setSelectedProspecto(null);
          }}
          onSave={handleSaveProspecto}
          siguienteId={siguienteProspectoId}
        />
      )}

      {isVentasFormOpen && (
        <VentaForm
          ventaInicial={selectedVenta}
          onClose={() => {
            setIsVentasFormOpen(false);
            setSelectedVenta(null);
          }}
          onSave={handleSaveVenta}
          siguienteId={siguienteVentaId}
        />
      )}

      {/* Custom Deletion Confirmation Modal Dialog (Clients) */}
      {clienteToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            id="delete-confirmation-dialog"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50 flex items-start space-x-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 font-display">
                  ¿Confirmar eliminación?
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {clienteToDelete.id}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente a <strong>{clienteToDelete.empresa}</strong>? Esta acción borrará su fila en la hoja de cálculo de Google Sheets de forma irreversible.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
              <button
                id="cancel-delete-btn"
                onClick={() => setClienteToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/10 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Eliminando...</span>
                  </div>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Deletion Confirmation Modal Dialog (Prospectos) */}
      {prospectoToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            id="prospecto-delete-confirmation-dialog"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50 flex items-start space-x-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 font-display">
                  ¿Confirmar eliminación?
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {prospectoToDelete.id}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente al prospecto <strong>{prospectoToDelete.empresa}</strong>? Esta acción borrará su fila en la hoja de cálculo de Google Sheets de forma irreversible.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
              <button
                id="cancel-prospecto-delete-btn"
                onClick={() => setProspectoToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                id="confirm-prospecto-delete-btn"
                onClick={handleConfirmProspectoDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/10 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Eliminando...</span>
                  </div>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Deletion Confirmation Modal Dialog (Ventas) */}
      {ventaToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            id="venta-delete-confirmation-dialog"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50 flex items-start space-x-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 font-display">
                  ¿Confirmar eliminación?
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {ventaToDelete.id}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente el registro de venta para <strong>{ventaToDelete.cliente}</strong>? Esta acción borrará su fila en la hoja de cálculo de Google Sheets de forma irreversible.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
              <button
                id="cancel-venta-delete-btn"
                onClick={() => setVentaToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                id="confirm-venta-delete-btn"
                onClick={handleConfirmVentaDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/10 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Eliminando...</span>
                  </div>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isGastosFormOpen && (
        <GastoForm
          gastoInicial={selectedGasto}
          onClose={() => {
            setIsGastosFormOpen(false);
            setSelectedGasto(null);
          }}
          onSave={handleSaveGasto}
          siguienteId={siguienteGastoId}
        />
      )}

      {/* Custom Deletion Confirmation Modal Dialog (Gastos) */}
      {gastoToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            id="gasto-delete-confirmation-dialog"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50 flex items-start space-x-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 font-display">
                  ¿Confirmar eliminación?
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {gastoToDelete.id}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente el gasto de la categoría <strong>{gastoToDelete.categoria}</strong>? Esta acción borrará su fila en la hoja de cálculo de Google Sheets de forma irreversible.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
              <button
                id="cancel-gasto-delete-btn"
                onClick={() => setGastoToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                id="confirm-gasto-delete-btn"
                onClick={handleConfirmGastoDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/10 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Eliminando...</span>
                  </div>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isRenovacionesFormOpen && (
        <RenovacionForm
          renovacionInicial={selectedRenovacion}
          onClose={() => {
            setIsRenovacionesFormOpen(false);
            setSelectedRenovacion(null);
          }}
          onSave={handleSaveRenovacion}
          siguienteId={siguienteRenovacionId}
        />
      )}

      {selectedRenovacionForReminder && (
        <ReminderModal
          renovacion={selectedRenovacionForReminder}
          onClose={() => setSelectedRenovacionForReminder(null)}
        />
      )}

      {/* Custom Deletion Confirmation Modal Dialog (Renovaciones) */}
      {renovacionToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            id="renovacion-delete-confirmation-dialog"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50 flex items-start space-x-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 font-display">
                  ¿Confirmar eliminación?
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {renovacionToDelete.id}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente la renovación para <strong>{renovacionToDelete.cliente}</strong> ({renovacionToDelete.servicio})? Esta acción borrará su fila en la hoja de cálculo de Google Sheets de forma irreversible.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
              <button
                id="cancel-renovacion-delete-btn"
                onClick={() => setRenovacionToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                id="confirm-renovacion-delete-btn"
                onClick={handleConfirmRenovacionDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/10 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Eliminando...</span>
                  </div>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTareasFormOpen && (
        <TareaForm
          tareaInicial={selectedTarea}
          onClose={() => {
            setIsTareasFormOpen(false);
            setSelectedTarea(null);
          }}
          onSave={handleSaveTarea}
          siguienteId={siguienteTareaId}
        />
      )}

      {/* Custom Deletion Confirmation Modal Dialog (Tareas) */}
      {tareaToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            id="tarea-delete-confirmation-dialog"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50 flex items-start space-x-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 font-display">
                  ¿Confirmar eliminación?
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {tareaToDelete.id}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente la tarea <strong>{tareaToDelete.titulo}</strong>? Esta acción borrará su fila en la hoja de cálculo de Google Sheets de forma irreversible.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
              <button
                id="cancel-tarea-delete-btn"
                onClick={() => setTareaToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                id="confirm-tarea-delete-btn"
                onClick={handleConfirmTareaDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/10 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Eliminando...</span>
                  </div>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
