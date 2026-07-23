import React, { useState, useRef } from 'react';
import { LeadExtraido, Prospecto } from '../types';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Trash2, 
  Edit2, 
  Phone, 
  MessageCircle, 
  X, 
  Upload, 
  FileSpreadsheet, 
  UserCheck, 
  Globe, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Calendar,
  Tag,
  DollarSign,
  FileText
} from 'lucide-react';
import {
  addExtraccionLead,
  addExtraccionLeadsBatch,
  updateExtraccionLead,
  deleteExtraccionLead,
  getExtraccionLeads
} from '../extraccionService';

interface ExtraccionCentinelaProps {
  leadsExtraidos: LeadExtraido[];
  onSaveLeads: (leads: LeadExtraido[]) => void;
  onConvertToProspecto: (lead: LeadExtraido, customFields?: Partial<Prospecto>) => Promise<void>;
  setIntegrationModalInfo: (info: any) => void;
  isProspectsConnected: boolean;
  token?: string | null;
  extraccionSpreadsheetId?: string | null;
  onRefreshLeads?: () => Promise<void>;
}

const PAISES_PREDEFINIDOS = [
  { nombre: 'Argentina', prefijo: '+54' },
  { nombre: 'Bolivia', prefijo: '+591' },
  { nombre: 'Brasil', prefijo: '+55' },
  { nombre: 'Chile', prefijo: '+56' },
  { nombre: 'Colombia', prefijo: '+57' },
  { nombre: 'Costa Rica', prefijo: '+506' },
  { nombre: 'Cuba', prefijo: '+53' },
  { nombre: 'Ecuador', prefijo: '+593' },
  { nombre: 'El Salvador', prefijo: '+503' },
  { fontColor: 'España', nombre: 'España', prefijo: '+34' },
  { nombre: 'Estados Unidos', prefijo: '+1' },
  { nombre: 'Guatemala', prefijo: '+502' },
  { nombre: 'Haití', prefijo: '+509' },
  { nombre: 'Honduras', prefijo: '+504' },
  { nombre: 'México', prefijo: '+52' },
  { nombre: 'Nicaragua', prefijo: '+505' },
  { nombre: 'Panamá', prefijo: '+507' },
  { nombre: 'Paraguay', prefijo: '+595' },
  { nombre: 'Perú', prefijo: '+51' },
  { nombre: 'Puerto Rico', prefijo: '+1' },
  { nombre: 'República Dominicana', prefijo: '+1' },
  { nombre: 'Uruguay', prefijo: '+598' },
  { nombre: 'Venezuela', prefijo: '+58' }
];

const SECTORES_PREDEFINIDOS = [
  'Varios Sectores',
  'Tecnología / Software',
  'Salud / Clínicas / Médicos',
  'Alimentos / Restaurantes / Cafés',
  'Servicios Profesionales / Asesoría',
  'Educación / Academias / Colegios',
  'Construcción / Inmobiliaria',
  'Comercio / Retail / Tiendas',
  'Turismo / Hotelería / Viajes',
  'Automotriz / Talleres / Concesionarios',
  'Estética / Belleza / Barberías',
  'Gimnasios / Deportes / Bienestar',
  'Entretenimiento / Eventos',
  'Logística / Transporte / Envíos',
  'Otro Sector'
];

// Helper functions to clean empresa names and phone numbers
export const cleanEmpresaName = (rawName: string): string => {
  if (!rawName) return '';
  let cleaned = String(rawName).trim();
  // Remove "Enlace visitado" and variants like "·Enlace visitado", " - Enlace visitado", " | Enlace visitado", "visited link", etc.
  cleaned = cleaned
    .replace(/[·\-\|\u00B7\.]?\s*(enlace\s+visitado|visited\s+link)/gi, '')
    .trim();
  return cleaned;
};

export const cleanPhoneNumber = (rawPhone: string): string => {
  if (!rawPhone) return '';
  // Strip all non-digit characters (no '+' or symbols)
  return String(rawPhone).replace(/[^\d]/g, '');
};

export default function ExtraccionCentinela({
  leadsExtraidos,
  onSaveLeads,
  onConvertToProspecto,
  setIntegrationModalInfo,
  isProspectsConnected,
  token,
  extraccionSpreadsheetId,
  onRefreshLeads
}: ExtraccionCentinelaProps) {
  // Filters & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [paisFilter, setPaisFilter] = useState('Todos');
  const [fechaFilter, setFechaFilter] = useState('Todos');
  const [categoriaFilter, setCategoriaFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(10);

  // Modal / Dialogue States
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertWizardOpen, setIsConvertWizardOpen] = useState(false);
  
  // Country selection temp values
  const [selectedPais, setSelectedPais] = useState('Colombia');
  const [customPaisNombre, setCustomPaisNombre] = useState('');
  const [customPaisPrefijo, setCustomPaisPrefijo] = useState('');
  const [isCustomCountry, setIsCustomCountry] = useState(false);
  const [defaultBatchCategory, setDefaultBatchCategory] = useState('Varios Sectores');

  // Import summary state
  const [importSummary, setImportSummary] = useState({
    exitosos: 0,
    duplicados: 0,
    errores: 0,
  });

  // Edit lead temp state
  const [editingLead, setEditingLead] = useState<LeadExtraido | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Deletion confirmation state
  const [leadToDelete, setLeadToDelete] = useState<LeadExtraido | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sheets batch-saving spinner state
  const [isSavingLeadsToSheets, setIsSavingLeadsToSheets] = useState(false);

  // Convert Prospect Wizard state
  const [wizardLead, setWizardLead] = useState<LeadExtraido | null>(null);
  const [wizardEmpresa, setWizardEmpresa] = useState('');
  const [wizardContacto, setWizardContacto] = useState('');
  const [wizardTelefono, setWizardTelefono] = useState('');
  const [wizardCorreo, setWizardCorreo] = useState('');
  const [wizardPais, setWizardPais] = useState('');
  const [wizardServicioInteres, setWizardServicioInteres] = useState('');
  const [wizardValorEstimado, setWizardValorEstimado] = useState('0');
  const [wizardEstado, setWizardEstado] = useState('Nuevo');
  const [wizardObservaciones, setWizardObservaciones] = useState('');
  const [wizardTipoIdentificacion, setWizardTipoIdentificacion] = useState('');
  const [wizardNumeroIdentificacion, setWizardNumeroIdentificacion] = useState('');
  const [wizardProximoSeguimiento, setWizardProximoSeguimiento] = useState('');

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  // Temp holder for the file to process after country is selected
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelected = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx' && extension !== 'csv') {
      alert('Por favor selecciona únicamente archivos .xlsx o .csv.');
      return;
    }
    setPendingFile(file);
    setIsCountryModalOpen(true);
  };

  // Process selected file with selected country details
  const startImportation = () => {
    if (!pendingFile) return;

    let countryName = selectedPais;
    let countryPrefix = '';

    if (isCustomCountry) {
      if (!customPaisNombre.trim() || !customPaisPrefijo.trim()) {
        alert('Por favor completa el nombre y prefijo del país personalizado.');
        return;
      }
      countryName = customPaisNombre.trim();
      countryPrefix = customPaisPrefijo.trim();
      if (!countryPrefix.startsWith('+')) {
        countryPrefix = '+' + countryPrefix;
      }
    } else {
      const found = PAISES_PREDEFINIDOS.find(p => p.nombre === selectedPais);
      countryPrefix = found ? found.prefijo : '+57';
    }

    setIsCountryModalOpen(false);

    const reader = new FileReader();
    const extension = pendingFile.name.split('.').pop()?.toLowerCase();

    if (extension === 'xlsx') {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          processParsedData(jsonData, countryName, countryPrefix);
        } catch (err) {
          console.error(err);
          alert('Error al leer el archivo Excel.');
        }
      };
      reader.readAsArrayBuffer(pendingFile);
    } else if (extension === 'csv') {
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const rows = parseCSVText(text);
          processParsedData(rows, countryName, countryPrefix);
        } catch (err) {
          console.error(err);
          alert('Error al leer el archivo CSV.');
        }
      };
      reader.readAsText(pendingFile, 'UTF-8');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPendingFile(null);
  };

  // Standard CSV Parser that handles quoted values with commas
  const parseCSVText = (text: string): any[] => {
    const lines: string[] = [];
    let currentLine = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        currentLine += char;
      } else if (char === '\n' && !inQuotes) {
        lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    if (lines.length < 2) return [];

    // Parse header
    const headers = parseCSVLine(lines[0]);
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const rowText = lines[i].trim();
      if (!rowText) continue;
      const values = parseCSVLine(rowText);
      const rowObject: any = {};
      headers.forEach((header, index) => {
        rowObject[header] = values[index] !== undefined ? values[index] : '';
      });
      result.push(rowObject);
    }

    return result;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let currentVal = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    result.push(currentVal.trim());
    return result;
  };

  // Core parsing and validation logic
  const processParsedData = (rawRows: any[], countryName: string, countryPrefix: string) => {
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    const currentLeads = [...leadsExtraidos];
    const newLeadsList: LeadExtraido[] = [];

    rawRows.forEach((row) => {
      // Map columns
      const empresaRaw = row.Nombre || row.name || row.Empresa || row.empresa || '';
      const telefonoRaw = row.Teléfono || row.phone || row.telefono || row.Telefono || '';
      const correoRaw = row.Email || row.email || row.Correo || row.correo || row.Contacto || '';
      const contactoRaw = row.Contacto || row.contacto || row.contactName || row.contact || '';
      const categoriaRaw = row.Categoría || row.category || row.categoria || row.Category || row.Sector || row.sector || '';

      // Normalize string checks
      const empresa = cleanEmpresaName(String(empresaRaw));
      const telefono = String(telefonoRaw).trim();
      const correo = String(correoRaw).trim();
      const contacto = String(contactoRaw).trim();
      const categoria = String(categoriaRaw).trim();

      // Check for empty row
      if (!empresa && !telefono && !correo) {
        return; // Empty row, simply skip without counting as error
      }

      // Check for empty phone
      if (!telefono) {
        errorCount++;
        return;
      }

      // Validate phone length (Must be at least 7 digits after strip)
      const numericDigits = cleanPhoneNumber(telefono);
      if (numericDigits.length < 7) {
        errorCount++;
        return;
      }

      // Format telephone internationally without '+'
      const numericPrefix = countryPrefix.replace(/[^\d]/g, '');
      let formattedPhone = numericDigits;
      if (!formattedPhone.startsWith(numericPrefix) || formattedPhone.length <= 8) {
        formattedPhone = numericPrefix + formattedPhone;
      }

      // Validate email format if present
      let formattedEmail = correo;
      if (correo) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
          errorCount++;
          return;
        }
        formattedEmail = correo.toLowerCase();
      }

      // Check for duplicates in current CRM state, imported list, and batch
      const isDuplicate = 
        currentLeads.some(l => cleanPhoneNumber(l.telefono) === formattedPhone || (formattedEmail && l.correo === formattedEmail)) ||
        newLeadsList.some(l => l.telefono === formattedPhone || (formattedEmail && l.correo === formattedEmail));

      if (isDuplicate) {
        duplicateCount++;
        return;
      }

      // Perfect Lead Extraido Record
      const newLead: LeadExtraido = {
        id: 'L-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        empresa: empresa || 'Empresa sin nombre',
        contacto: contacto || '',
        telefono: formattedPhone,
        correo: formattedEmail,
        pais: countryName,
        fechaImportacion: new Date().toISOString().split('T')[0],
        categoria: categoria || defaultBatchCategory || 'Varios Sectores'
      };

      newLeadsList.push(newLead);
      successCount++;
    });

    if (newLeadsList.length > 0) {
      if (token && extraccionSpreadsheetId) {
        setIsSavingLeadsToSheets(true);
        addExtraccionLeadsBatch(token, extraccionSpreadsheetId, newLeadsList)
          .then(() => {
            const updatedList = [...newLeadsList, ...leadsExtraidos];
            onSaveLeads(updatedList);
            setIsSavingLeadsToSheets(false);
          })
          .catch((err) => {
            console.error('Error saving to Google Sheets:', err);
            alert('Error al guardar en Google Sheets, pero se guardó localmente.');
            const updatedList = [...newLeadsList, ...leadsExtraidos];
            onSaveLeads(updatedList);
            setIsSavingLeadsToSheets(false);
          });
      } else {
        const updatedList = [...newLeadsList, ...leadsExtraidos];
        onSaveLeads(updatedList);
      }
    }

    setImportSummary({
      exitosos: successCount,
      duplicados: duplicateCount,
      errores: errorCount,
    });
    setIsSummaryModalOpen(true);
    setCurrentPage(1); // Reset pagination to page 1
  };

  // Delete Lead Handler
  const handleDeleteLead = (lead: LeadExtraido) => {
    setLeadToDelete(lead);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      if (token && extraccionSpreadsheetId) {
        try {
          await deleteExtraccionLead(token, extraccionSpreadsheetId, leadToDelete.id);
        } catch (sheetErr) {
          console.warn('No se pudo eliminar de Google Sheets (se procede a eliminar localmente):', sheetErr);
        }
      }
      const updated = leadsExtraidos.filter(l => l.id !== leadToDelete.id);
      onSaveLeads(updated);
      setLeadToDelete(null);
    } catch (err) {
      console.error('Error al eliminar el lead:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (lead: LeadExtraido) => {
    setEditingLead({ 
      ...lead,
      empresa: cleanEmpresaName(lead.empresa),
      telefono: cleanPhoneNumber(lead.telefono)
    });
    setIsEditModalOpen(true);
  };

  // Save Edited Lead
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const cleanedEmpresa = cleanEmpresaName(editingLead.empresa);
    const cleanedTelefono = cleanPhoneNumber(editingLead.telefono);

    if (!cleanedEmpresa.trim()) {
      alert('El nombre de la empresa es obligatorio.');
      return;
    }

    if (!cleanedTelefono.trim()) {
      alert('El teléfono es obligatorio.');
      return;
    }

    const updatedLead: LeadExtraido = {
      ...editingLead,
      empresa: cleanedEmpresa,
      telefono: cleanedTelefono
    };

    setIsSavingEdit(true);
    try {
      if (token && extraccionSpreadsheetId) {
        try {
          await updateExtraccionLead(token, extraccionSpreadsheetId, updatedLead);
        } catch (sheetErr) {
          console.warn('No se pudo actualizar en Google Sheets (se actualizó localmente):', sheetErr);
        }
      }
      const updated = leadsExtraidos.map(l => l.id === updatedLead.id ? updatedLead : l);
      onSaveLeads(updated);
      setIsEditModalOpen(false);
      setEditingLead(null);
    } catch (err) {
      console.error('Error updating lead:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Convert lead to prospect action with wizard
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const handleConvertClick = (lead: LeadExtraido) => {
    if (!isProspectsConnected) {
      alert('Debes conectar o crear primero la base de datos de "Prospectos" en Google Sheets.');
      return;
    }
    
    // Prefill Wizard details
    setWizardLead(lead);
    setWizardEmpresa(cleanEmpresaName(lead.empresa));
    setWizardContacto(lead.contacto || '');
    setWizardTelefono(cleanPhoneNumber(lead.telefono));
    setWizardCorreo(lead.correo || '');
    setWizardPais(lead.pais || '');
    setWizardServicioInteres(lead.categoria || 'Varios Sectores');
    setWizardValorEstimado('0');
    setWizardEstado('Nuevo');
    setWizardObservaciones(`Lead importado desde Extracción Centinela. Categoría original: ${lead.categoria || 'Varios Sectores'}`);
    setWizardTipoIdentificacion('');
    setWizardNumeroIdentificacion('');
    setWizardProximoSeguimiento('');
    setIsConvertWizardOpen(true);
  };

  const handleSaveWizard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardLead) return;

    setConvertingId(wizardLead.id);
    setIsConvertWizardOpen(false);

    try {
      await onConvertToProspecto(wizardLead, {
        empresa: wizardEmpresa,
        contacto: wizardContacto || 'Contacto Principal',
        telefono: wizardTelefono,
        correo: wizardCorreo,
        pais: wizardPais,
        servicioInteres: wizardServicioInteres || 'Por definir',
        valorEstimado: wizardValorEstimado,
        estado: wizardEstado,
        observaciones: wizardObservaciones,
        tipoIdentificacion: wizardTipoIdentificacion,
        numeroIdentificacion: wizardNumeroIdentificacion,
        proximoSeguimiento: wizardProximoSeguimiento,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setConvertingId(null);
      setWizardLead(null);
    }
  };

  // Filter & Search computation
  const filteredLeads = leadsExtraidos.filter((lead) => {
    const matchesSearch = 
      lead.empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contacto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.telefono.includes(searchQuery) ||
      (lead.correo && lead.correo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.categoria && lead.categoria.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPais = paisFilter === 'Todos' || lead.pais === paisFilter;
    const matchesFecha = fechaFilter === 'Todos' || lead.fechaImportacion === fechaFilter;
    const matchesCategoria = categoriaFilter === 'Todos' || lead.categoria === categoriaFilter;

    return matchesSearch && matchesPais && matchesFecha && matchesCategoria;
  });

  // Unique lists for filters dropdown
  const uniqueCountries = Array.from(new Set(leadsExtraidos.map(l => l.pais)));
  const uniqueDates = Array.from(new Set(leadsExtraidos.map(l => l.fechaImportacion))).sort((a, b) => b.localeCompare(a));
  const uniqueCategories = Array.from(new Set(leadsExtraidos.map(l => l.categoria || 'Varios Sectores')));

  // Pagination computations
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage) || 1;
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      
      {/* SECTION 1: HEADER BANNER IN BRANDED INDIGO/BLUE GRADIENT */}
      <div className="bg-gradient-to-br from-[#2E5BFF] via-[#1D9BF0] to-[#00F5D4] text-white p-6 sm:p-8 rounded-3xl shadow-[0_15px_35px_rgba(46,91,255,0.18)] relative overflow-hidden flex flex-col lg:flex-row items-center gap-6 justify-between border-0">
        
        {/* Decorative ambient background rings */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-lg pointer-events-none" />

        <div className="space-y-3 max-w-xl text-center lg:text-left relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-bold text-white shadow-sm">
            <span>📥 IMPORTADOR DE LEADS CENTINELA</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black font-display tracking-tight text-white drop-shadow-sm">
            Importa Leads desde Lead Extractor
          </h3>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
            Sube el archivo Excel (<code>.xlsx</code>) o CSV generado por tu extensión de Google Maps. Los contactos se filtrarán, validarán, categorizarán y limpiarán para brindarte una base comercial impecable.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center lg:justify-start pt-2">
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Formateo Internacional
            </span>
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Sin Duplicados
            </span>
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Categorías de Sector
            </span>
          </div>
        </div>

        {/* DRAG & DROP ZONE / UPLOAD BUTTON */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`w-full lg:w-80 h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 group relative z-10 ${
            isDragging 
              ? 'border-white bg-white/25 scale-105 shadow-inner' 
              : 'border-white/40 bg-white/10 hover:border-white/70 hover:bg-white/15 hover:scale-[1.02] shadow-sm'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.csv" 
            className="hidden" 
          />
          <div className="p-3 bg-white/15 group-hover:bg-white/25 rounded-xl mb-2 text-white transition-all duration-300 shadow-sm">
            <Upload size={24} className="animate-bounce" />
          </div>
          <p className="text-xs font-black text-center text-white tracking-wide">
            {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra o selecciona tu archivo'}
          </p>
          <p className="text-[10px] text-center text-blue-50 mt-1 font-semibold">
            Formatos aceptados: .xlsx y .csv
          </p>
        </div>
      </div>

      {/* SECTION 2: FILTERS & CONTROLS */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-4 justify-between items-center">
        <div className="w-full flex flex-col lg:flex-row items-center gap-3 w-full">
          {/* Search bar */}
          <div className="relative w-full lg:flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              id="leads-search-input"
              type="text"
              placeholder="Buscar por Empresa, Contacto, Teléfono, Correo o Categoría..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs text-slate-700 placeholder-slate-400 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Expanded filters row */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2.5 shrink-0 self-stretch lg:self-auto">
            {/* Country filter */}
            <div className="w-full sm:w-40">
              <select
                id="leads-pais-filter"
                value={paisFilter}
                onChange={(e) => {
                  setPaisFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-xs text-slate-700 font-bold transition-all"
              >
                <option value="Todos">🌍 Todos los países</option>
                {uniqueCountries.map((pais) => (
                  <option key={pais} value={pais}>📍 {pais}</option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div className="w-full sm:w-40">
              <select
                id="leads-fecha-filter"
                value={fechaFilter}
                onChange={(e) => {
                  setFechaFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-xs text-slate-700 font-bold transition-all"
              >
                <option value="Todos">📅 Todas las fechas</option>
                {uniqueDates.map((fecha) => (
                  <option key={fecha} value={fecha}>🗓️ {fecha}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-44">
              <select
                id="leads-categoria-filter"
                value={categoriaFilter}
                onChange={(e) => {
                  setCategoriaFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-xs text-slate-700 font-bold transition-all"
              >
                <option value="Todos">🏷️ Todos los sectores</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>🏷️ {cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-between pt-1.5 border-t border-slate-200/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Mostrando resultados filtrados en tiempo real
          </span>
          <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">
            📊 EN BANDEJA: {filteredLeads.length} de {leadsExtraidos.length} LEADS
          </span>
        </div>
      </div>

      {/* SECTION 3: DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {leadsExtraidos.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-50 text-indigo-500 rounded-full mb-4">
              <FileSpreadsheet size={36} />
            </div>
            <h4 className="text-base font-bold text-slate-700 font-display">Bandeja de Leads Vacía</h4>
            <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
              Comienza arrastrando un archivo Excel o CSV extraído por la extensión en el panel de arriba para iniciar la gestión comercial.
            </p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
              <Search size={36} />
            </div>
            <h4 className="text-base font-bold text-slate-700 font-display">Sin Resultados</h4>
            <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
              No encontramos leads que coincidan con los filtros de búsqueda, país, fecha y categoría seleccionados.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setPaisFilter('Todos');
                setFechaFilter('Todos');
                setCategoriaFilter('Todos');
              }}
              className="mt-4 px-4 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Sector / Categoría</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">País</th>
                  <th className="py-3 px-4 text-center">Contactar</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {currentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/75 group transition-colors">
                    {/* Empresa */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{cleanEmpresaName(lead.empresa)}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lead.id} • Importado {lead.fechaImportacion}</div>
                    </td>

                    {/* Sector / Categoría */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        <Tag size={10} className="text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{lead.categoria || 'Varios Sectores'}</span>
                      </span>
                    </td>

                    {/* Contacto */}
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {lead.contacto ? (
                        lead.contacto
                      ) : (
                        <span className="text-[10px] text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded">No asignado</span>
                      )}
                    </td>

                    {/* Teléfono */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {cleanPhoneNumber(lead.telefono)}
                    </td>

                    {/* Correo */}
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {lead.correo ? (
                        lead.correo
                      ) : (
                        <span className="text-slate-300 font-mono text-[10px]">-</span>
                      )}
                    </td>

                    {/* País */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        <Globe size={10} className="text-slate-400" />
                        <span>{lead.pais}</span>
                      </span>
                    </td>

                    {/* Contactar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* LLAMAR */}
                        <button
                          type="button"
                          onClick={() => {
                            setIntegrationModalInfo({ 
                              isOpen: true, 
                              type: 'llamada', 
                              contactName: lead.contacto || cleanEmpresaName(lead.empresa),
                              phone: cleanPhoneNumber(lead.telefono),
                              asunto: `Llamada de prospección comercial inicial`,
                              valor: '0',
                              originalRecord: lead
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Llamar con Agente Comercial IA"
                        >
                          <Phone size={14} />
                        </button>

                        {/* WHATSAPP */}
                        <button
                          type="button"
                          onClick={() => {
                            setIntegrationModalInfo({ 
                              isOpen: true, 
                              type: 'whatsapp', 
                              contactName: lead.contacto || cleanEmpresaName(lead.empresa),
                              phone: cleanPhoneNumber(lead.telefono),
                              asunto: `Hola ${lead.contacto || cleanEmpresaName(lead.empresa)}, un gusto saludarte. Te escribimos de parte de Centinela para presentarte nuestras soluciones...`,
                              valor: '0',
                              originalRecord: lead
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Enviar Plantilla WhatsApp (n8n)"
                        >
                          <MessageCircle size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Convert to Prospect */}
                        <button
                          onClick={() => handleConvertClick(lead)}
                          disabled={convertingId === lead.id}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all flex items-center justify-center font-bold"
                          title="Convertir en Prospecto CRM"
                        >
                          {convertingId === lead.id ? (
                            <svg className="animate-spin h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <UserCheck size={14} />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Editar Lead"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteLead(lead)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Eliminar Lead"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINACIÓN */}
        {filteredLeads.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/75 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-500 font-medium">
              Mostrando <span className="font-semibold text-slate-700">{indexOfFirstLead + 1}</span> a <span className="font-semibold text-slate-700">{Math.min(indexOfLastLead, filteredLeads.length)}</span> de <span className="font-semibold text-slate-700">{filteredLeads.length}</span> registros
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                <span>Registros por página:</span>
                <select
                  value={leadsPerPage}
                  onChange={(e) => {
                    setLeadsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-200 rounded bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
                  title="Anterior"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-xs font-mono font-bold text-slate-700 px-3 py-1 bg-white border border-slate-200 rounded">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-slate-200 rounded bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
                  title="Siguiente"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DIALOG 1: ¿De qué país pertenecen estos leads? (With expanded list and default category) */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <Globe size={20} className="text-indigo-600 animate-spin-slow" />
                <h4 className="text-base font-extrabold text-slate-800 font-display">Configurar País y Categoría</h4>
              </div>
              <button 
                onClick={() => setIsCountryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Para formatear adecuadamente los teléfonos y clasificar correctamente tus leads, por favor define las características principales del lote.
              </p>

              {/* Selector de País */}
              <div className="space-y-3">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">País de Origen</label>
                  <select
                    value={isCustomCountry ? 'custom' : selectedPais}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomCountry(true);
                      } else {
                        setIsCustomCountry(false);
                        setSelectedPais(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs bg-white font-semibold"
                  >
                    {PAISES_PREDEFINIDOS.map(p => (
                      <option key={p.nombre} value={p.nombre}>{p.nombre} ({p.prefijo})</option>
                    ))}
                    <option value="custom">Otro país...</option>
                  </select>
                </div>

                {/* Custom input panel if chosen */}
                {isCustomCountry && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Nombre País</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Chile" 
                        value={customPaisNombre}
                        onChange={(e) => setCustomPaisNombre(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-md text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Prefijo (Código)</label>
                      <input 
                        type="text" 
                        placeholder="Ej. +56" 
                        value={customPaisPrefijo}
                        onChange={(e) => setCustomPaisPrefijo(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-md text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Sector / Default category for the Batch */}
                <div className="flex flex-col space-y-1.5 pt-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Sector / Categoría por Defecto
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Se usará si el archivo de importación no contiene columna de sector.
                  </p>
                  <select
                    value={defaultBatchCategory}
                    onChange={(e) => setDefaultBatchCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs bg-white font-semibold"
                  >
                    {SECTORES_PREDEFINIDOS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50/50">
              <button
                onClick={() => setIsCountryModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={startImportation}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm shadow-indigo-600/10"
              >
                Confirmar e Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 2: IMPORT SUMMARY DIALOGUE */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-lg font-extrabold text-slate-800 font-display">Resumen de Importación</h4>
              <p className="text-xs text-slate-400 mt-1">El archivo se ha procesado exitosamente</p>

              <div className="grid grid-cols-3 gap-3 my-6">
                <div className="p-3 bg-emerald-50 border border-emerald-100/50 rounded-2xl text-center">
                  <div className="text-lg font-black text-emerald-600">{importSummary.exitosos}</div>
                  <div className="text-[9px] font-bold text-emerald-800/70 uppercase tracking-wider mt-0.5">Correctos</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100/50 rounded-2xl text-center">
                  <div className="text-lg font-black text-amber-600">{importSummary.duplicados}</div>
                  <div className="text-[9px] font-bold text-amber-800/70 uppercase tracking-wider mt-0.5">Duplicados</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-100/50 rounded-2xl text-center">
                  <div className="text-lg font-black text-rose-600">{importSummary.errores}</div>
                  <div className="text-[9px] font-bold text-rose-800/70 uppercase tracking-wider mt-0.5">Errores</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed text-left bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                💡 Los registros con error omitieron teléfonos vacíos o correos con formato inválido. Los duplicados se filtraron comparando correos y teléfonos contra la base de datos actual de leads y del CRM.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-center bg-slate-50">
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="w-full px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-slate-900/10"
              >
                Aceptar y Ver Leads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 3: EDIT LEAD MODAL */}
      {isEditModalOpen && editingLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Edit2 size={16} className="text-indigo-600" />
                <h4 className="text-base font-extrabold text-slate-800 font-display">Editar Datos de Lead</h4>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingLead(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Empresa */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre de Empresa</label>
                  <input
                    type="text"
                    value={editingLead.empresa}
                    onChange={(e) => setEditingLead({ ...editingLead, empresa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold"
                    required
                  />
                </div>

                {/* Sector / Categoria */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sector / Categoría</label>
                  <select
                    value={editingLead.categoria || 'Varios Sectores'}
                    onChange={(e) => setEditingLead({ ...editingLead, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs bg-white font-semibold"
                  >
                    {SECTORES_PREDEFINIDOS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Contacto */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre de Contacto</label>
                  <input
                    type="text"
                    value={editingLead.contacto}
                    onChange={(e) => setEditingLead({ ...editingLead, contacto: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold"
                  />
                </div>

                {/* Teléfono */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Número Telefónico (Internacional)</label>
                  <input
                    type="text"
                    value={editingLead.telefono}
                    onChange={(e) => setEditingLead({ ...editingLead, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono font-semibold"
                    required
                  />
                </div>

                {/* Correo */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editingLead.correo}
                    onChange={(e) => setEditingLead({ ...editingLead, correo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingLead(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm shadow-indigo-600/10 disabled:opacity-50 min-w-[120px]"
                >
                  {isSavingEdit ? (
                    <div className="flex items-center justify-center space-x-1.5">
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 4: CONVERT LEAD TO PROSPECT WIZARD (COMPLETAR DATOS QUE FALTAN) */}
      {isConvertWizardOpen && wizardLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 font-display">Mapear y Completar Datos de Prospecto</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Define los datos del CRM para iniciar el seguimiento comercial</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsConvertWizardOpen(false);
                  setWizardLead(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWizard}>
              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto bg-slate-50/30">
                
                {/* SECTION: BASIC & CONTACT INFO */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-sm space-y-4">
                  <h5 className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Globe size={12} /> 1. Datos Generales y de Contacto
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Empresa */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre de la Empresa</label>
                      <input
                        type="text"
                        value={wizardEmpresa}
                        onChange={(e) => setWizardEmpresa(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-semibold"
                        required
                      />
                    </div>

                    {/* Contacto */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre del Contacto</label>
                      <input
                        type="text"
                        value={wizardContacto}
                        onChange={(e) => setWizardContacto(e.target.value)}
                        placeholder="Ej. Gerente de Compras / Nombre"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-semibold"
                      />
                    </div>

                    {/* Teléfono */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Teléfono Móvil (WhatsApp)</label>
                      <input
                        type="text"
                        value={wizardTelefono}
                        onChange={(e) => setWizardTelefono(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-mono font-semibold"
                        required
                      />
                    </div>

                    {/* Correo */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Correo Electrónico</label>
                      <input
                        type="email"
                        value={wizardCorreo}
                        onChange={(e) => setWizardCorreo(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-semibold"
                      />
                    </div>

                    {/* Pais */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">País de Residencia</label>
                      <select
                        value={wizardPais}
                        onChange={(e) => setWizardPais(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs bg-white font-semibold"
                      >
                        {PAISES_PREDEFINIDOS.map(p => (
                          <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION: COMMERCIAL & CRM INFO */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-sm space-y-4">
                  <h5 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Tag size={12} /> 2. Clasificación y Valores de Negocio
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Servicio de Interés / Categoría */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Servicio de Interés / Sector</label>
                      <select
                        value={wizardServicioInteres}
                        onChange={(e) => setWizardServicioInteres(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs bg-white font-semibold"
                      >
                        {SECTORES_PREDEFINIDOS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Valor Estimado */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Valor Estimado del Negocio</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">
                          $
                        </span>
                        <input
                          type="text"
                          value={wizardValorEstimado}
                          onChange={(e) => setWizardValorEstimado(e.target.value)}
                          className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-semibold"
                          required
                        />
                      </div>
                    </div>

                    {/* Estado del Prospecto */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Estado Comercial Inicial</label>
                      <select
                        value={wizardEstado}
                        onChange={(e) => setWizardEstado(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs bg-white font-semibold"
                      >
                        <option value="Nuevo">🟢 Nuevo (Lead Importado)</option>
                        <option value="En seguimiento">🟡 En Seguimiento</option>
                        <option value="Interesado">🔵 Interesado / Cotizado</option>
                        <option value="Negociacion">🟠 En Negociación</option>
                        <option value="Perdido">🔴 Descartado / No Interesado</option>
                      </select>
                    </div>

                    {/* Proximo Seguimiento */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Próximo Seguimiento Agendado</label>
                      <input
                        type="date"
                        value={wizardProximoSeguimiento}
                        onChange={(e) => setWizardProximoSeguimiento(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="flex flex-col space-y-1 pt-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Notas u Observaciones Iniciales</label>
                    <textarea
                      value={wizardObservaciones}
                      onChange={(e) => setWizardObservaciones(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium"
                      placeholder="Agrega notas descriptivas sobre este prospecto..."
                    />
                  </div>
                </div>

                {/* SECTION: IDENTIFICATION & OPTIONAL BILLING INFO */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-sm space-y-4">
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <FileText size={12} /> 3. Identificación Comercial (Opcional)
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo de Identificacion */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Identificación (NIT/RUT/CC/RFC)</label>
                      <input
                        type="text"
                        value={wizardTipoIdentificacion}
                        onChange={(e) => setWizardTipoIdentificacion(e.target.value)}
                        placeholder="Ej. NIT / RFC"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-semibold"
                      />
                    </div>

                    {/* Numero de Identificacion */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Número de Documento</label>
                      <input
                        type="text"
                        value={wizardNumeroIdentificacion}
                        onChange={(e) => setWizardNumeroIdentificacion(e.target.value)}
                        placeholder="Ej. 901.432.122-1"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end space-x-2.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setIsConvertWizardOpen(false);
                    setWizardLead(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1"
                >
                  <CheckCircle2 size={14} />
                  <span>Migrar a Prospecto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Deletion Confirmation Modal Dialog (Leads Extraidos) */}
      {leadToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            id="delete-lead-confirmation-dialog"
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
                  ID: {leadToDelete.id}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente a <strong>{cleanEmpresaName(leadToDelete.empresa)}</strong>? Esta acción borrará su registro de forma irreversible.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
              <button
                id="cancel-delete-lead-btn"
                onClick={() => setLeadToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-lead-btn"
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
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saving Leads to Sheets Overlay */}
      {isSavingLeadsToSheets && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center space-y-4 max-w-sm border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <svg className="animate-spin h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h4 className="text-base font-bold text-slate-800 font-display">Guardando en Google Sheets...</h4>
            <p className="text-xs text-slate-500">Sincronizando el lote de leads extraídos directamente con tu hoja de cálculo "Extracción Centinela".</p>
          </div>
        </div>
      )}
    </div>
  );
}
