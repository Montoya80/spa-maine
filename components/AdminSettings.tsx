
import React, { useState, useEffect } from 'react';
import { Service, Promotion, BusinessConfig, Patient, Appointment, Employee, Product, BankingInfo, ProductCategoryType, EmailConfig } from '../types';
import { Plus, Trash2, Tag, Clock, CalendarOff, ToggleLeft, ToggleRight, MapPin, Download, FileSpreadsheet, Save, RotateCcw, Mail, Edit2, Calendar, CreditCard, Database, Code, Terminal, Image as ImageIcon, Printer, Facebook, Instagram, Video, Github, ShoppingBag, Beaker, Package, FileCode, Cpu, FileJson, Server } from 'lucide-react';
import { MEXICAN_BANKS } from '../constants';
import Logo from './Logo';

interface AdminSettingsProps {
  services: Service[];
  promotions: Promotion[];
  products: Product[];
  businessConfig: BusinessConfig;
  patients: Patient[];
  appointments: Appointment[];
  employees: Employee[];
  onUpdateServices: (services: Service[]) => void;
  onUpdatePromotions: (promotions: Promotion[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateConfig: (config: BusinessConfig) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({
  services,
  promotions,
  products,
  businessConfig,
  patients,
  appointments,
  employees,
  onUpdateServices,
  onUpdatePromotions,
  onUpdateProducts,
  onUpdateConfig
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'products' | 'promos' | 'config' | 'contact' | 'email' | 'banking' | 'data' | 'system'>('services');
  
  // Sub-tab for Products (Separation of Concerns)
  const [productTypeTab, setProductTypeTab] = useState<ProductCategoryType>('retail');

  const [localConfig, setLocalConfig] = useState<BusinessConfig>(businessConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCustomBank, setIsCustomBank] = useState(false);

  // Helper for empty Email Config
  const emptyEmailConfig: EmailConfig = {
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPass: '',
      senderEmail: '',
      senderName: '',
      enabled: false
  };

  useEffect(() => {
    setLocalConfig(prev => ({
        ...businessConfig,
        contact: businessConfig.contact || { address: '', phone: '', whatsapp: '', email: '', mapUrl: '', facebookUrl: '', instagramUrl: '', tiktokUrl: '' },
        emailConfig: businessConfig.emailConfig || emptyEmailConfig,
        bankingInfo: businessConfig.bankingInfo || { bankName: '', accountNumber: '', clabe: '', cardNumber: '', accountHolder: '' }
    }));
    setHasChanges(false);
    const currentBank = businessConfig.bankingInfo?.bankName || '';
    if (currentBank && !MEXICAN_BANKS.includes(currentBank) && currentBank !== '') {
        setIsCustomBank(true);
    } else {
        setIsCustomBank(false);
    }
  }, [businessConfig]);

  // Service Form State
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('60');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceImage, setNewServiceImage] = useState<string | null>(null);

  // Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductType, setNewProductType] = useState<ProductCategoryType>('retail');

  // Promo Form State
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');
  const [newPromoValidUntil, setNewPromoValidUntil] = useState('');

  // Config State
  const [blockDate, setBlockDate] = useState('');
  const [blockTimeDate, setBlockTimeDate] = useState('');
  const [blockTimeHour, setBlockTimeHour] = useState('');

  // --- Handlers ---

  // Service Handlers
  const handleServiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) { const reader = new FileReader(); reader.onloadend = () => setNewServiceImage(reader.result as string); reader.readAsDataURL(file); }
  };
  const handleEditService = (service: Service) => {
      setEditingServiceId(service.id); setNewServiceName(service.name); setNewServicePrice(service.price.toString());
      setNewServiceDuration(service.duration.toString()); setNewServiceDesc(service.description || ''); setNewServiceImage(service.imageUrl || null);
  };
  const resetServiceForm = () => {
      setEditingServiceId(null); setNewServiceName(''); setNewServicePrice(''); setNewServiceDuration('60'); setNewServiceDesc(''); setNewServiceImage(null);
  };
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingServiceId) {
        const updated = services.map(s => s.id === editingServiceId ? { ...s, name: newServiceName, price: parseFloat(newServicePrice), duration: parseInt(newServiceDuration), description: newServiceDesc, imageUrl: newServiceImage || undefined } : s);
        onUpdateServices(updated);
    } else {
        const newService: Service = { id: `s-${Date.now()}`, name: newServiceName, price: parseFloat(newServicePrice), duration: parseInt(newServiceDuration), active: true, description: newServiceDesc, imageUrl: newServiceImage || undefined };
        onUpdateServices([...services, newService]);
    }
    resetServiceForm();
  };
  const handleToggleService = (id: string) => { onUpdateServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s)); };
  const handleDeleteService = (id: string) => { if(confirm('¿Eliminar servicio?')) { onUpdateServices(services.filter(s => s.id !== id)); if (editingServiceId === id) resetServiceForm(); } };

  // --- Product Handlers ---
  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) { const reader = new FileReader(); reader.onloadend = () => setNewProductImage(reader.result as string); reader.readAsDataURL(file); }
  };

  const handleEditProduct = (product: Product) => {
      setEditingProductId(product.id);
      setNewProductName(product.name);
      setNewProductPrice(product.price.toString());
      setNewProductStock(product.stock.toString());
      setNewProductDesc(product.description || '');
      setNewProductImage(product.imageUrl || null);
      setNewProductCategory(product.category || '');
      setNewProductType(product.categoryType || 'retail');
  };

  const resetProductForm = () => {
      setEditingProductId(null);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductStock('');
      setNewProductDesc('');
      setNewProductImage(null);
      setNewProductCategory('');
      setNewProductType(productTypeTab);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingProductId) {
          const updated = products.map(p => p.id === editingProductId ? {
              ...p,
              name: newProductName,
              price: parseFloat(newProductPrice),
              stock: parseInt(newProductStock),
              description: newProductDesc,
              imageUrl: newProductImage || undefined,
              category: newProductCategory,
              categoryType: newProductType
          } : p);
          onUpdateProducts(updated);
      } else {
          const newProduct: Product = {
              id: `prod-${Date.now()}`,
              name: newProductName,
              price: parseFloat(newProductPrice),
              stock: parseInt(newProductStock),
              active: true,
              description: newProductDesc,
              imageUrl: newProductImage || undefined,
              category: newProductCategory,
              categoryType: newProductType
          };
          onUpdateProducts([...products, newProduct]);
      }
      resetProductForm();
  };

  const handleToggleProduct = (id: string) => {
      onUpdateProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const handleDeleteProduct = (id: string) => {
      if(confirm('¿Eliminar producto?')) {
          onUpdateProducts(products.filter(p => p.id !== id));
          if (editingProductId === id) resetProductForm();
      }
  };

  // Promo Handlers
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPromoId) {
        onUpdatePromotions(promotions.map(p => p.id === editingPromoId ? { ...p, title: newPromoTitle, description: newPromoDesc, discountText: newPromoDiscount, validUntil: newPromoValidUntil } : p));
    } else {
        const colors = ['bg-orange-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        onUpdatePromotions([...promotions, { id: `promo-${Date.now()}`, title: newPromoTitle, description: newPromoDesc, discountText: newPromoDiscount, validUntil: newPromoValidUntil, active: true, color: randomColor }]);
    }
    resetPromoForm();
  };
  const handleEditPromo = (promo: Promotion) => { setEditingPromoId(promo.id); setNewPromoTitle(promo.title); setNewPromoDesc(promo.description); setNewPromoDiscount(promo.discountText); setNewPromoValidUntil(promo.validUntil || ''); };
  const resetPromoForm = () => { setEditingPromoId(null); setNewPromoTitle(''); setNewPromoDesc(''); setNewPromoDiscount(''); setNewPromoValidUntil(''); };
  const handleDeletePromo = (id: string) => { if (confirm('¿Eliminar promoción?')) { onUpdatePromotions(promotions.filter(p => p.id !== id)); if (editingPromoId === id) resetPromoForm(); } };

  // Configuration Handlers (Local State)
  const saveConfigChanges = () => { onUpdateConfig(localConfig); setHasChanges(false); alert('¡Cambios guardados exitosamente!'); };
  const cancelConfigChanges = () => { 
      setLocalConfig({
        ...businessConfig,
        contact: businessConfig.contact || { address: '', phone: '', whatsapp: '', email: '', mapUrl: '', facebookUrl: '', instagramUrl: '', tiktokUrl: '' },
        emailConfig: businessConfig.emailConfig || emptyEmailConfig,
        bankingInfo: businessConfig.bankingInfo || { bankName: '', accountNumber: '', clabe: '', cardNumber: '', accountHolder: '' }
      }); 
      setHasChanges(false); 
      setIsCustomBank(false); 
  };
  
  const handleDayUpdate = (dayIndex: number, field: string, value: any) => { const updatedSchedule = [...localConfig.schedule]; updatedSchedule[dayIndex] = { ...updatedSchedule[dayIndex], [field]: value }; setLocalConfig({ ...localConfig, schedule: updatedSchedule }); setHasChanges(true); };
  const handleAddBlockDate = () => { if (blockDate && !localConfig.blockedDates.includes(blockDate)) { setLocalConfig({ ...localConfig, blockedDates: [...localConfig.blockedDates, blockDate].sort() }); setBlockDate(''); setHasChanges(true); } };
  const handleRemoveBlockDate = (date: string) => { setLocalConfig({ ...localConfig, blockedDates: localConfig.blockedDates.filter(d => d !== date) }); setHasChanges(true); };
  const handleAddBlockSlot = () => { if (blockTimeDate && blockTimeHour) { const slot = `${blockTimeDate} ${blockTimeHour}`; if (!localConfig.blockedSlots.includes(slot)) { setLocalConfig({ ...localConfig, blockedSlots: [...localConfig.blockedSlots, slot].sort() }); setBlockTimeDate(''); setBlockTimeHour(''); setHasChanges(true); } } };
  const handleRemoveBlockSlot = (slot: string) => { setLocalConfig({ ...localConfig, blockedSlots: localConfig.blockedSlots.filter(s => s !== slot) }); setHasChanges(true); };
  const handleContactUpdate = (field: string, value: string) => { setLocalConfig(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } })); setHasChanges(true); };
  const handleEmailUpdate = (field: string, value: any) => { setLocalConfig(prev => ({ ...prev, emailConfig: { ...prev.emailConfig, [field]: value } })); setHasChanges(true); };
  const handleBankingUpdate = (field: string, value: string) => { setLocalConfig(prev => ({ ...prev, bankingInfo: { ...(prev.bankingInfo || { bankName: '', accountNumber: '', clabe: '', cardNumber: '', accountHolder: '' }), [field]: value } })); setHasChanges(true); };
  const handleBankSelection = (value: string) => { if (value === 'Otro') { setIsCustomBank(true); handleBankingUpdate('bankName', ''); } else { setIsCustomBank(false); handleBankingUpdate('bankName', value); } };

  // --- DOWNLOAD & EXPORT FUNCTIONS ---

  const downloadFile = (content: string, filename: string, type: string) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const exportToCSV = (type: 'patients' | 'appointments') => {
      let data: any[] = []; let filename = '';
      if (type === 'patients') { data = patients.map(p => ({ ID: p.id, Nombre: p.fullName, Email: p.email, Telefono: p.phone, Codigo: p.clientCode })); filename = 'clientes.csv'; } 
      else { data = appointments.map(a => ({ ID: a.id, Cliente: a.patientName, Servicio: a.service, Fecha: a.date, Hora: a.time, Estado: a.status })); filename = 'citas.csv'; }
      const headers = Object.keys(data[0]).join(","); const rows = data.map(obj => Object.values(obj).join(",")).join("\n"); 
      downloadFile(headers + "\n" + rows, filename, "text/csv;charset=utf-8");
  };

  const generateFullBackup = () => {
      const fullData = { date: new Date().toISOString(), version: "1.0", businessConfig, services, products, promotions, employees, patients, appointments };
      const jsonString = JSON.stringify(fullData, null, 2); 
      downloadFile(jsonString, `backup_${new Date().toISOString().split('T')[0]}.json`, "application/json");
  };

  // --- SYSTEM FILES GENERATORS ---

  const generateEnvFile = () => {
      // Intenta obtener la API Key real del entorno, o usa un placeholder si no existe
      const apiKey = process.env.API_KEY || 'TU_API_KEY_AQUI';
      const content = `
GEMINI_API_KEY=${apiKey}
# Archivo generado automáticamente desde el Panel de Admin
      `.trim();
      downloadFile(content, '.env', 'text/plain');
  };

  const generatePackageJson = () => {
      const content = {
        "name": "maine-spa-center",
        "private": true,
        "version": "1.0.0",
        "type": "module",
        "scripts": {
          "dev": "vite",
          "build": "tsc && vite build",
          "preview": "vite preview"
        },
        "dependencies": {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "lucide-react": "^0.344.0",
          "@google/genai": "^1.30.0"
        },
        "devDependencies": {
          "@types/node": "^20.0.0",
          "@types/react": "^18.2.66",
          "@types/react-dom": "^18.2.22",
          "@vitejs/plugin-react": "^4.2.1",
          "typescript": "^5.2.2",
          "vite": "^5.2.0",
          "tailwindcss": "^3.4.1",
          "autoprefixer": "^10.4.18",
          "postcss": "^8.4.35"
        }
      };
      downloadFile(JSON.stringify(content, null, 2), 'package.json', 'application/json');
  };

  const generateViteConfig = () => {
      const content = `
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
      `.trim();
      downloadFile(content, 'vite.config.ts', 'text/typescript');
  };

  const generateHtaccess = () => {
      const content = `
# Apache Configuration for React SPA
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Caching Strategies
<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    Header set Cache-Control "max-age=31536000, public"
  </FilesMatch>
  <FilesMatch "\\.(html|json)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>
      `.trim();
      downloadFile(content, '.htaccess', 'text/plain');
  };

  const generateIndexHtml = () => {
      const content = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Maine SPA Center</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
      `.trim();
      downloadFile(content, 'index.html', 'text/html');
  };

  const downloadSourceCodeInstructions = () => {
      const content = `
GUÍA DE DESPLIEGUE EN APACHE2 (Ubuntu/Debian)
=======================================================

IMPORTANTE: Esta aplicación usa React.js. No puedes simplemente copiar los archivos .tsx al servidor.
Debes "compilar" el proyecto para generar archivos estáticos (HTML, CSS, JS).

PASO 1: PREPARACIÓN LOCAL
-------------------------
1. Descarga el archivo 'package.json' y 'vite.config.ts' desde el panel de Admin.
2. Asegúrate de tener todo el código fuente en tu computadora.
3. Abre una terminal en la carpeta del proyecto.
4. Instala las dependencias:
   $ npm install
5. Genera la versión de producción:
   $ npm run build

Esto creará una carpeta llamada 'dist'. Esta carpeta contiene tu App lista para Apache.

PASO 2: CONFIGURACIÓN DEL SERVIDOR
----------------------------------
1. Copia el contenido de la carpeta 'dist' a tu servidor Apache:
   /var/www/html/ (o tu carpeta pública configurada)

2. Descarga el archivo '.htaccess' desde el panel de Admin.
3. Coloca el '.htaccess' en la misma carpeta (/var/www/html/).
   Esto es vital para que las rutas (como /dashboard) funcionen al recargar la página.

4. Asegúrate de que el módulo 'rewrite' esté activo en Apache:
   $ sudo a2enmod rewrite
   $ sudo systemctl restart apache2

5. Verifica que tu configuración de VirtualHost permita overrides:
   <Directory /var/www/html>
       AllowOverride All
   </Directory>

PASO 3: VARIABLES DE ENTORNO
----------------------------
1. Descarga el archivo '.env' desde el panel de Admin.
2. Úsalo durante el proceso de 'build' localmente, o configúralo en tu servicio de CI/CD.
      `.trim();
      downloadFile(content, 'LEEME_INSTRUCCIONES_APACHE.txt', 'text/plain');
  };

  const handleDownloadSVG = (id: string, name: string) => { alert('Para descargar el logo, haz clic derecho sobre la imagen y selecciona "Guardar imagen como..."'); };

  const filteredProducts = products.filter(p => p.categoryType === productTypeTab || (!p.categoryType && productTypeTab === 'retail'));
  const inputClass = "w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 outline-none bg-white text-slate-900";

  return (
    <div className="animate-fade-in space-y-6 pb-24 relative">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configuración del Centro</h2>
        <p className="text-slate-500">Gestiona catálogo, productos, horarios y datos de la empresa.</p>
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 no-scrollbar">
        {['services', 'products', 'promos', 'config', 'contact', 'email', 'banking', 'data', 'system'].map((tab) => (
            <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap capitalize ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                {tab === 'services' ? 'Tratamientos' : tab === 'products' ? 'Productos' : tab === 'promos' ? 'Promociones' : tab === 'config' ? 'Horarios' : tab === 'contact' ? 'Ubicación' : tab === 'email' ? 'Notificaciones' : tab === 'banking' ? 'Pagos' : tab === 'data' ? 'Base de Datos' : 'Sistema'}
            </button>
        ))}
      </div>

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-100 font-medium text-xs text-slate-500 uppercase hidden md:grid">
                    <div className="col-span-1">Img</div>
                    <div className="col-span-4">Tratamiento</div>
                    <div className="col-span-2">Duración</div>
                    <div className="col-span-2">Precio</div>
                    <div className="col-span-3 text-center">Acciones</div>
                </div>
                <div className="divide-y divide-slate-50">
                    {services.map(service => (
                        <div key={service.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center ${!service.active ? 'opacity-50 bg-slate-50' : ''}`}>
                            <div className="col-span-1"><div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">{service.imageUrl ? <img src={service.imageUrl} className="w-full h-full object-cover"/> : <ImageIcon className="w-full h-full p-2 text-slate-300"/>}</div></div>
                            <div className="col-span-4 font-medium text-slate-800">{service.name}<p className="text-[10px] text-slate-400 truncate">{service.description}</p></div>
                            <div className="col-span-2 text-sm text-slate-600 md:block"><span className="md:hidden font-bold">Duración:</span> {service.duration} min</div>
                            <div className="col-span-2 text-sm font-semibold text-primary-600 md:block"><span className="md:hidden font-bold">Precio:</span> ${service.price}</div>
                            <div className="col-span-3 flex justify-start md:justify-center gap-2">
                                <button onClick={() => handleToggleService(service.id)} className={`${service.active ? 'text-green-500' : 'text-slate-400'}`}>{service.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}</button>
                                <button onClick={() => handleEditService(service)} className="text-blue-400 hover:text-blue-600 p-1"><Edit2 size={18} /></button>
                                <button onClick={() => handleDeleteService(service.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          {/* Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">{editingServiceId ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-primary-500" />}{editingServiceId ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}</h3>
                {editingServiceId && <button onClick={resetServiceForm} className="text-xs text-slate-400 hover:text-slate-600">Cancelar</button>}
            </div>
            <form onSubmit={handleSaveService} className="space-y-4">
                <div className="flex justify-center mb-2">
                    <label className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden relative">
                        {newServiceImage ? <img src={newServiceImage} className="absolute inset-0 w-full h-full object-cover" /> : <><ImageIcon className="text-slate-400 mb-2" /><span className="text-xs text-slate-500">Subir Imagen</span></>}
                        <input type="file" accept="image/*" onChange={handleServiceFileChange} className="hidden" />
                    </label>
                </div>
                <div><label className="text-xs font-semibold text-slate-500 uppercase">Nombre</label><input required value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs font-semibold text-slate-500 uppercase">Descripción</label><textarea value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} className={inputClass} style={{height: '4rem', resize: 'none'}} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Precio ($)</label><input required type="number" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Minutos</label><input required type="number" value={newServiceDuration} onChange={e => setNewServiceDuration(e.target.value)} className={inputClass} /></div>
                </div>
                <button type="submit" className={`w-full text-white py-2 rounded-lg font-medium ${editingServiceId ? 'bg-blue-600' : 'bg-primary-600'}`}>Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-slate-100 pb-4">
                <button onClick={() => setProductTypeTab('retail')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${productTypeTab === 'retail' ? 'bg-purple-600 text-white shadow-purple-200 shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}><ShoppingBag size={18} /><span>🏪 Venta al Público</span></button>
                <button onClick={() => setProductTypeTab('professional')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${productTypeTab === 'professional' ? 'bg-cyan-600 text-white shadow-cyan-200 shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}><Beaker size={18} /><span>🧪 Insumos de Cabina</span></button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-100 font-medium text-xs text-slate-500 uppercase hidden md:grid">
                        <div className="col-span-1">Img</div>
                        <div className="col-span-4">{productTypeTab === 'retail' ? 'Producto' : 'Insumo'}</div>
                        <div className="col-span-2">Categoría</div>
                        <div className="col-span-1">Stock</div>
                        <div className="col-span-2">{productTypeTab === 'retail' ? 'Precio Venta' : 'Costo Unitario'}</div>
                        <div className="col-span-2 text-center">Acciones</div>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {filteredProducts.map(product => (
                            <div key={product.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center ${!product.active ? 'opacity-50 bg-slate-50' : ''}`}>
                                <div className="col-span-1"><div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">{product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover"/> : (product.categoryType === 'professional' ? <Beaker className="text-slate-300" size={20}/> : <ShoppingBag className="text-slate-300" size={20}/>)}</div></div>
                                <div className="col-span-4 font-medium text-slate-800">{product.name}<p className="text-[10px] text-slate-400 truncate">{product.description}</p></div>
                                <div className="col-span-2 text-sm text-slate-600 md:block"><span className="md:hidden font-bold">Cat:</span> {product.category || 'General'}</div>
                                <div className="col-span-1 text-sm text-slate-600 font-mono"><span className="md:hidden font-bold">Stock:</span> {product.stock}</div>
                                <div className="col-span-2 text-sm font-semibold text-primary-600 md:block"><span className="md:hidden font-bold">Precio:</span> ${product.price}</div>
                                <div className="col-span-2 flex justify-start md:justify-center gap-2">
                                    <button onClick={() => handleToggleProduct(product.id)} className={`${product.active ? 'text-green-500' : 'text-slate-400'}`}>{product.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}</button>
                                    <button onClick={() => handleEditProduct(product)} className="text-blue-400 hover:text-blue-600 p-1"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (<div className="p-12 text-center text-slate-400 bg-slate-50"><Package size={40} className="mx-auto mb-2 opacity-50" />No hay items registrados.</div>)}
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">{editingProductId ? <Edit2 size={18} className="text-blue-500" /> : (productTypeTab === 'retail' ? <ShoppingBag size={18} className="text-purple-500" /> : <Beaker size={18} className="text-cyan-500" />)}{editingProductId ? 'Editar Item' : (productTypeTab === 'retail' ? 'Nuevo Producto' : 'Nuevo Insumo')}</h3>
                    {editingProductId && <button onClick={resetProductForm} className="text-xs text-slate-400 hover:text-slate-600">Cancelar</button>}
                </div>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="flex justify-center mb-2"><label className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden relative">{newProductImage ? (<img src={newProductImage} className="absolute inset-0 w-full h-full object-cover" />) : (<>{productTypeTab === 'retail' ? <ShoppingBag className="text-slate-400 mb-2" /> : <Beaker className="text-slate-400 mb-2" />}<span className="text-xs text-slate-500">Subir Imagen</span></>)}<input type="file" accept="image/*" onChange={handleProductFileChange} className="hidden" /></label></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Tipo</label><select value={newProductType} onChange={e => setNewProductType(e.target.value as ProductCategoryType)} className={inputClass}><option value="retail">🛒 Venta al Público</option><option value="professional">🧴 Uso Interno (Cabina)</option></select></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Nombre</label><input required value={newProductName} onChange={e => setNewProductName(e.target.value)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Categoría</label><input value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Descripción</label><textarea value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} className={inputClass} style={{ height: '4rem', resize: 'none' }} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-semibold text-slate-500 uppercase">{newProductType === 'retail' ? 'Precio Venta ($)' : 'Costo Unitario ($)'}</label><input required type="number" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} className={inputClass} /></div>
                        <div><label className="text-xs font-semibold text-slate-500 uppercase">Stock Actual</label><input required type="number" value={newProductStock} onChange={e => setNewProductStock(e.target.value)} className={inputClass} /></div>
                    </div>
                    <button type="submit" className={`w-full text-white py-2 rounded-lg font-medium transition-colors ${editingProductId ? 'bg-blue-600' : (productTypeTab === 'retail' ? 'bg-purple-600' : 'bg-cyan-600')}`}>{editingProductId ? 'Actualizar' : 'Agregar'}</button>
                </form>
            </div>
            </div>
        </div>
      )}

      {/* PROMOS TAB */}
      {activeTab === 'promos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotions.map(promo => (
                    <div key={promo.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-2 rounded-bl-xl text-white text-xs font-bold ${promo.color}`}>{promo.discountText}</div>
                        <h4 className="font-bold text-slate-900 text-lg mb-1">{promo.title}</h4>
                        <p className="text-slate-500 text-sm mb-2">{promo.description}</p>
                        {promo.validUntil && <div className="flex items-center gap-1 text-xs text-slate-400 mb-3"><Calendar size={12} /> Válido hasta: {promo.validUntil}</div>}
                        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                            <span className={`text-xs px-2 py-1 rounded-full ${promo.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{promo.active ? 'Activa' : 'Inactiva'}</span>
                            <div className="flex gap-1">
                                <button onClick={() => handleEditPromo(promo)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeletePromo(promo.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-800 flex items-center gap-2">{editingPromoId ? <Edit2 size={18} className="text-blue-500" /> : <Tag size={18} className="text-pink-500" />}{editingPromoId ? 'Editar Promoción' : 'Nueva Promoción'}</h3>{editingPromoId && <button onClick={resetPromoForm} className="text-xs text-slate-400 hover:text-slate-600">Cancelar</button>}</div>
                <form onSubmit={handleSavePromo} className="space-y-4">
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Título</label><input required value={newPromoTitle} onChange={e => setNewPromoTitle(e.target.value)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Descripción</label><textarea required value={newPromoDesc} onChange={e => setNewPromoDesc(e.target.value)} className={inputClass} style={{ height: '5rem', resize: 'none' }} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Etiqueta de Descuento</label><input required value={newPromoDiscount} onChange={e => setNewPromoDiscount(e.target.value)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Vigencia</label><input required type="date" value={newPromoValidUntil} onChange={e => setNewPromoValidUntil(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} /></div>
                    <button type="submit" className={`w-full text-white py-2 rounded-lg font-medium transition-colors ${editingPromoId ? 'bg-blue-600' : 'bg-slate-900'}`}>{editingPromoId ? 'Actualizar' : 'Crear'}</button>
                </form>
            </div>
        </div>
      )}

      {/* CONFIG TAB */}
      {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock className="text-indigo-500" /> Horario Semanal</h3>
                <div className="space-y-4">
                    {localConfig.schedule.map((day, index) => (
                        <div key={day.label} className={`flex items-center justify-between p-3 rounded-lg border ${day.isOpen ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent'}`}>
                            <div className="flex items-center gap-3 w-1/3">
                                <button onClick={() => handleDayUpdate(index, 'isOpen', !day.isOpen)} className={`${day.isOpen ? 'text-green-500' : 'text-slate-300'}`}>{day.isOpen ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}</button>
                                <span className={`font-medium ${day.isOpen ? 'text-slate-800' : 'text-slate-400'}`}>{day.label}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <input type="time" value={day.openTime} onChange={(e) => handleDayUpdate(index, 'openTime', e.target.value)} disabled={!day.isOpen} className="p-2 rounded border border-slate-300 text-sm w-28 bg-white disabled:bg-slate-100 disabled:text-slate-400" />
                                <span className="text-slate-400">-</span>
                                <input type="time" value={day.closeTime} onChange={(e) => handleDayUpdate(index, 'closeTime', e.target.value)} disabled={!day.isOpen} className="p-2 rounded border border-slate-300 text-sm w-28 bg-white disabled:bg-slate-100 disabled:text-slate-400" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             <div className="space-y-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><CalendarOff className="text-red-500" /> Días Bloqueados</h3>
                    <div className="flex gap-2 mb-4">
                        <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} className={inputClass} style={{marginTop:0, colorScheme: 'light'}} />
                        <button onClick={handleAddBlockDate} className="bg-red-500 text-white px-4 rounded-lg hover:bg-red-600"><Plus size={20} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {localConfig.blockedDates.map(date => (
                            <span key={date} className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 border border-red-100">{date}<button onClick={() => handleRemoveBlockDate(date)} className="text-red-400 hover:text-red-700"><Trash2 size={14} /></button></span>
                        ))}
                    </div>
                 </div>
             </div>
          </div>
      )}

      {/* CONTACT TAB */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MapPin className="text-teal-500" /> Ubicación y Contacto General</h3>
                <div className="space-y-4">
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Dirección Física</label><input value={localConfig.contact.address} onChange={e => handleContactUpdate('address', e.target.value)} className={inputClass} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-semibold text-slate-500 uppercase">Teléfono Fijo</label><input value={localConfig.contact.phone} onChange={e => handleContactUpdate('phone', e.target.value)} className={inputClass} /></div>
                        <div><label className="text-xs font-semibold text-slate-500 uppercase">WhatsApp</label><input value={localConfig.contact.whatsapp} onChange={e => handleContactUpdate('whatsapp', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Email de Contacto</label><input value={localConfig.contact.email} onChange={e => handleContactUpdate('email', e.target.value)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">URL Google Maps (Embed)</label><input value={localConfig.contact.mapUrl} onChange={e => handleContactUpdate('mapUrl', e.target.value)} className={inputClass} /><p className="text-[10px] text-slate-400 mt-1">Pega el enlace "src" del iframe de Google Maps.</p></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Facebook className="text-blue-600" /> Redes Sociales</h3>
                <div className="space-y-4">
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Facebook URL</label><div className="relative"><Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input value={localConfig.contact.facebookUrl || ''} onChange={e => handleContactUpdate('facebookUrl', e.target.value)} className={`${inputClass} pl-10`} /></div></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Instagram URL</label><div className="relative"><Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input value={localConfig.contact.instagramUrl || ''} onChange={e => handleContactUpdate('instagramUrl', e.target.value)} className={`${inputClass} pl-10`} /></div></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">TikTok URL</label><div className="relative"><Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input value={localConfig.contact.tiktokUrl || ''} onChange={e => handleContactUpdate('tiktokUrl', e.target.value)} className={`${inputClass} pl-10`} /></div></div>
                </div>
            </div>
        </div>
      )}

      {/* EMAIL TAB */}
      {activeTab === 'email' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><Mail className="text-blue-500" /> Configuración SMTP</h3>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${localConfig.emailConfig.enabled ? 'text-green-600' : 'text-slate-400'}`}>{localConfig.emailConfig.enabled ? 'Activado' : 'Desactivado'}</span>
                    <button onClick={() => handleEmailUpdate('enabled', !localConfig.emailConfig.enabled)} className={`${localConfig.emailConfig.enabled ? 'text-green-500' : 'text-slate-300'}`}>{localConfig.emailConfig.enabled ? <ToggleRight size={32}/> : <ToggleLeft size={32}/>}</button>
                </div>
            </div>
            <div className={`space-y-4 ${!localConfig.emailConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Host SMTP</label><input value={localConfig.emailConfig.smtpHost} onChange={e => handleEmailUpdate('smtpHost', e.target.value)} className={inputClass} placeholder="smtp.gmail.com" /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Puerto</label><input value={localConfig.emailConfig.smtpPort} onChange={e => handleEmailUpdate('smtpPort', e.target.value)} className={inputClass} placeholder="587" /></div>
                </div>
                <div><label className="text-xs font-semibold text-slate-500 uppercase">Usuario / Email</label><input value={localConfig.emailConfig.smtpUser} onChange={e => handleEmailUpdate('smtpUser', e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs font-semibold text-slate-500 uppercase">Contraseña / App Password</label><input type="password" value={localConfig.emailConfig.smtpPass} onChange={e => handleEmailUpdate('smtpPass', e.target.value)} className={inputClass} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Email Remitente</label><input value={localConfig.emailConfig.senderEmail} onChange={e => handleEmailUpdate('senderEmail', e.target.value)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Nombre Remitente</label><input value={localConfig.emailConfig.senderName} onChange={e => handleEmailUpdate('senderName', e.target.value)} className={inputClass} /></div>
                </div>
            </div>
        </div>
      )}

      {/* BANKING TAB */}
      {activeTab === 'banking' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><CreditCard className="text-purple-500" /> Datos Bancarios del Negocio</h3>
            <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg text-sm text-purple-800 mb-4 border border-purple-100">
                    Estos datos se mostrarán a los clientes para que realicen sus transferencias o depósitos.
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Banco</label>
                    <select className={inputClass} value={isCustomBank ? 'Otro' : (localConfig.bankingInfo?.bankName || '')} onChange={e => handleBankSelection(e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {MEXICAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                        <option value="Otro">Otro...</option>
                    </select>
                </div>
                {isCustomBank && <div><label className="text-xs font-semibold text-slate-500 uppercase">Nombre del Banco</label><input value={localConfig.bankingInfo?.bankName || ''} onChange={e => handleBankingUpdate('bankName', e.target.value)} className={inputClass} /></div>}
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">No. Cuenta</label><input value={localConfig.bankingInfo?.accountNumber || ''} onChange={e => handleBankingUpdate('accountNumber', e.target.value)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 uppercase">CLABE</label><input value={localConfig.bankingInfo?.clabe || ''} onChange={e => handleBankingUpdate('clabe', e.target.value)} className={inputClass} /></div>
                </div>
                <div><label className="text-xs font-semibold text-slate-500 uppercase">Titular de la Cuenta</label><input value={localConfig.bankingInfo?.accountHolder || ''} onChange={e => handleBankingUpdate('accountHolder', e.target.value)} className={inputClass} /></div>
            </div>
        </div>
      )}

      {/* DATA TAB */}
      {activeTab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileSpreadsheet className="text-green-600" /> Exportar Datos</h3>
                <p className="text-sm text-slate-500 mb-6">Descarga la información en formato CSV compatible con Excel.</p>
                <div className="space-y-3">
                    <button onClick={() => exportToCSV('patients')} className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-colors group">
                        <span className="font-medium text-slate-700 group-hover:text-green-700">Exportar Clientes</span>
                        <Download size={18} className="text-slate-400 group-hover:text-green-600" />
                    </button>
                    <button onClick={() => exportToCSV('appointments')} className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                        <span className="font-medium text-slate-700 group-hover:text-blue-700">Exportar Citas</span>
                        <Download size={18} className="text-slate-400 group-hover:text-blue-600" />
                    </button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Database className="text-indigo-600" /> Respaldo Completo</h3>
                <p className="text-sm text-slate-500 mb-6">Genera un archivo JSON con toda la base de datos del sistema para copias de seguridad.</p>
                <button onClick={generateFullBackup} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                    <Save size={20} /> Respaldar Todo (JSON)
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm md:col-span-2">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Server className="text-amber-600" /> Archivos de Sistema</h3>
                <p className="text-sm text-slate-500 mb-6">Descarga los archivos técnicos para desarrollo local.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={generateEnvFile} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium">
                        <span className="flex items-center gap-2"><FileCode size={16} className="text-amber-500"/> Configuración (.env con Key)</span>
                        <Download size={16} className="text-slate-400" />
                    </button>
                    <button onClick={generatePackageJson} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium">
                        <span className="flex items-center gap-2"><Package size={16} className="text-red-500"/> Dependencias (package.json)</span>
                        <Download size={16} className="text-slate-400" />
                    </button>
                    <button onClick={generateViteConfig} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium">
                        <span className="flex items-center gap-2"><Cpu size={16} className="text-blue-500"/> Configuración Build (vite.config)</span>
                        <Download size={16} className="text-slate-400" />
                    </button>
                    <button onClick={generateIndexHtml} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium">
                        <span className="flex items-center gap-2"><FileCode size={16} className="text-orange-500"/> Archivo Base (index.html)</span>
                        <Download size={16} className="text-slate-400" />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* SYSTEM TAB */}
      {activeTab === 'system' && (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Code className="text-slate-600" /> Despliegue en Servidor Apache2</h3>
                <p className="text-sm text-slate-500 mb-6">Herramientas para desplegar la aplicación en un servidor Apache de producción (como Ubuntu/Debian).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={downloadSourceCodeInstructions} className="bg-slate-100 text-slate-700 px-6 py-4 rounded-xl font-bold border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                        <Terminal size={18} /> Guía de Instalación Paso a Paso
                    </button>
                     <button onClick={generateHtaccess} className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-bold bg-white text-purple-700 shadow-sm">
                        <FileCode size={18} className="text-purple-500"/> Descargar .htaccess (Rutas SPA)
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Printer className="text-pink-600" /> Recursos de Marca (Logos)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center">
                        <div className="h-32 flex items-center justify-center w-full bg-slate-50 rounded-lg mb-4">
                            <Logo className="h-24" layout="vertical" slogan={true} />
                        </div>
                        <button onClick={() => handleDownloadSVG('logo-vertical', 'logo_vertical.svg')} className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 w-full">Descargar SVG (Vertical)</button>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center">
                        <div className="h-32 flex items-center justify-center w-full bg-slate-50 rounded-lg mb-4">
                            <Logo className="h-16" layout="horizontal" slogan={true} />
                        </div>
                        <button onClick={() => handleDownloadSVG('logo-horizontal', 'logo_horizontal.svg')} className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 w-full">Descargar SVG (Horizontal)</button>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center">
                        <div className="h-32 flex items-center justify-center w-full bg-slate-50 rounded-lg mb-4">
                            <Logo className="h-20" layout="icon" />
                        </div>
                        <button onClick={() => handleDownloadSVG('logo-icon', 'logo_icon.svg')} className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 w-full">Descargar SVG (Icono)</button>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {hasChanges && (
          <div className="fixed bottom-6 right-6 flex gap-3 animate-slide-down z-40">
              <button onClick={cancelConfigChanges} className="bg-white text-slate-600 px-6 py-3 rounded-full font-bold shadow-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-2"><RotateCcw size={18} /> Cancelar</button>
              <button onClick={saveConfigChanges} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-slate-800 flex items-center gap-2"><Save size={18} /> Guardar Cambios</button>
          </div>
      )}
    </div>
  );
};

export default AdminSettings;
