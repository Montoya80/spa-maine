
import React, { useState, useEffect } from 'react';
import { Appointment, Patient, Employee, BusinessConfig, Service, Promotion, Product } from '../types';
import { Calendar, Clock, User, Plus, X, MoreVertical, CheckCircle, XCircle, CalendarClock, MessageCircle, Mail, LayoutGrid, List, ChevronLeft, ChevronRight, Briefcase, CreditCard, Tag, UserCheck, ShoppingBag, AlertTriangle } from 'lucide-react';
import { generateWhatsAppLink, generateMailtoLink, getPaymentInfoMessage } from '../services/notificationService';
import { INITIAL_SERVICES } from '../constants'; 

interface AppointmentManagerProps {
  appointments: Appointment[];
  patients?: Patient[];
  employees?: Employee[]; 
  businessConfig?: BusinessConfig; 
  services?: Service[]; 
  promotions?: Promotion[];
  products?: Product[];
  onAddAppointment: (appointment: Appointment) => void;
  startOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onRequestNewPatient?: () => void;
  canEdit: boolean; 
  onUpdateAppointment?: (appointment: Appointment) => void; 
  currentUser?: Employee; 
}

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ 
  appointments: initialAppointments, 
  patients = [], 
  employees = [],
  businessConfig,
  services = INITIAL_SERVICES,
  promotions = [],
  products = [],
  onAddAppointment,
  startOpen = false,
  onOpenChange,
  onRequestNewPatient,
  canEdit,
  onUpdateAppointment,
  currentUser
}) => {
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(initialAppointments);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => { setLocalAppointments(initialAppointments); }, [initialAppointments]);

  const [showModal, setShowModal] = useState(false);
  
  // Reschedule Modal
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Dropdown state
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  // Payment/Adjustment Modal State
  const [paymentModalData, setPaymentModalData] = useState<{
      isOpen: boolean;
      appointment: Appointment | null;
      patient: Patient | null;
      currentService: string;
      currentPrice: number;
      discountPercent: number;
      isNewClient: boolean;
  }>({ 
      isOpen: false, appointment: null, patient: null, currentService: '', currentPrice: 0, discountPercent: 0, isNewClient: false 
  });

  useEffect(() => { if (startOpen && canEdit) setShowModal(true); }, [startOpen, canEdit]);

  const handleModalClose = () => { setShowModal(false); if (onOpenChange) onOpenChange(false); };
  
  // New Appointment State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [price, setPrice] = useState('');

  const findItemPrice = (name: string) => {
      const srv = services.find(s => s.name === name);
      if (srv) return srv.price;
      const prod = products.find(p => p.name === name);
      if (prod) return prod.price;
      const promo = promotions.find(p => p.title === name);
      if (promo) return promo.price || 0;
      return 0;
  };

  const sortedAppointments = [...localAppointments].sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const patient = patients.find(p => p.id === selectedPatientId);
    
    if (patient) {
        const newApt: Appointment = {
            id: `apt${Date.now()}`,
            patientId: patient.id,
            patientName: patient.fullName,
            date,
            time,
            service,
            price: price ? parseFloat(price) : undefined,
            discount: 0,
            status: 'confirmed',
            assignedTo: assignedTo || undefined,
            paymentVerified: false
        };
        setLocalAppointments([newApt, ...localAppointments]);
        onAddAppointment(newApt);
        handleModalClose();
        handleOpenPaymentModal(newApt);
        
        setSelectedPatientId('');
        setService('');
        setDate('');
        setTime('');
        setAssignedTo('');
        setPrice('');
    }
  };

  const handleOpenPaymentModal = (apt: Appointment) => {
      const patient = patients.find(p => p.id === apt.patientId);
      if (patient) {
          const isNewClient = (!patient.history || patient.history.length === 0);
          setPaymentModalData({
              isOpen: true,
              appointment: apt,
              patient: patient,
              currentService: apt.service,
              currentPrice: apt.price || 0,
              discountPercent: apt.discount || 0,
              isNewClient: isNewClient
          });
          setActiveActionMenu(null);
      }
  };

  const handleServiceChangeInPayment = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      const newPrice = findItemPrice(val);
      setPaymentModalData(prev => ({ ...prev, currentService: val, currentPrice: newPrice }));
  };

  const savePaymentAdjustments = () => {
      if (!paymentModalData.appointment) return;
      const updatedApt: Appointment = {
          ...paymentModalData.appointment,
          service: paymentModalData.currentService,
          price: paymentModalData.currentPrice,
          discount: paymentModalData.discountPercent,
          discountAppliedBy: (paymentModalData.discountPercent !== paymentModalData.appointment.discount && paymentModalData.discountPercent > 0) ? currentUser?.fullName : paymentModalData.appointment.discountAppliedBy
      };
      const updatedList = localAppointments.map(a => a.id === updatedApt.id ? updatedApt : a);
      setLocalAppointments(updatedList);
      if (onUpdateAppointment) onUpdateAppointment(updatedApt);
      return updatedApt;
  };

  const sendNotification = (method: 'whatsapp' | 'email') => {
      const updatedApt = savePaymentAdjustments();
      const { patient, isNewClient } = paymentModalData;
      if (!updatedApt || !patient) return;

      const total = updatedApt.price || 0;
      const discountAmount = total * ((updatedApt.discount || 0) / 100);
      const finalPrice = total - discountAmount;
      const depositRequired = isNewClient ? finalPrice * 0.25 : finalPrice;

      const messages = getPaymentInfoMessage(patient, businessConfig?.bankingInfo, finalPrice, depositRequired, !!isNewClient, updatedApt.service, updatedApt.discount);

      if (method === 'whatsapp') window.open(generateWhatsAppLink(patient.phone, messages.whatsapp), '_blank');
      else window.open(generateMailtoLink(patient.email, messages.emailSubject, messages.emailBody), '_blank');
  };

  const renderServiceOptions = () => (
      <>
        <optgroup label="Tratamientos">
            {services.filter(s => s.active).map(s => <option key={s.id} value={s.name}>{s.name} - ${s.price}</option>)}
        </optgroup>
        <optgroup label="Promociones">
            {promotions.filter(p => p.active).map(p => <option key={p.id} value={p.title}>{p.title} {p.price ? `- $${p.price}` : ''}</option>)}
        </optgroup>
        <optgroup label="Productos">
            {products.filter(p => p.active && p.stock > 0).map(p => <option key={p.id} value={p.name}>{p.name} - ${p.price}</option>)}
        </optgroup>
      </>
  );

  const inputClass = "w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-200 outline-none bg-white text-slate-900";

  return (
    <div className="space-y-6 animate-fade-in relative" onClick={() => setActiveActionMenu(null)}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Agenda de Citas / Ventas</h2>
        {canEdit && (
            <button onClick={() => setShowModal(true)} className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-700 transition-colors">
                <Plus size={18} /> Nueva Cita/Venta
            </button>
        )}
      </div>

      {viewMode === 'list' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible min-h-[400px]">
            <div className="divide-y divide-slate-50">
            {sortedAppointments.map((apt) => (
                <div key={apt.id} className="grid grid-cols-1 md:grid-cols-9 items-center hover:bg-slate-50 p-4 relative group">
                    <div className="md:col-span-2 font-semibold text-slate-800">{apt.patientName}</div>
                    <div className="md:col-span-2 text-slate-600 text-sm">{apt.service}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-500"><Calendar size={14}/> {apt.date}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-500"><Clock size={14}/> {apt.time}</div>
                    <div className="text-center">{apt.paymentVerified ? <span className="text-green-600 font-bold text-xs">Pagado</span> : <span className="text-amber-500 font-bold text-xs">Pendiente</span>}</div>
                    <div className="text-center"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">{apt.status}</span></div>
                    <div className="text-right">
                        {canEdit && (
                            <button onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === apt.id ? null : apt.id); }} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                                <MoreVertical size={16} />
                            </button>
                        )}
                        {activeActionMenu === apt.id && (
                            <div className="absolute right-8 top-8 z-20 bg-white rounded-lg shadow-xl border border-slate-100 w-56 overflow-hidden">
                                <button onClick={() => handleOpenPaymentModal(apt)} className="w-full text-left px-4 py-3 text-sm hover:bg-purple-50 text-purple-700 flex items-center gap-2 font-medium">
                                    <CreditCard size={14} /> Cobrar / Detalles
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            </div>
          </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-down">
                <div className="bg-primary-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg">Nueva Cita / Venta</h3>
                    <button onClick={handleModalClose} className="hover:bg-primary-700 p-1 rounded-full"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                        <select required value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} className={inputClass}>
                            <option value="">Seleccionar Cliente</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Item (Servicio, Promo o Producto)</label>
                        <select required value={service} onChange={(e) => { const val = e.target.value; setService(val); setPrice(findItemPrice(val).toString()); }} className={inputClass}>
                            <option value="">Seleccionar...</option>
                            {renderServiceOptions()}
                        </select>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Costo Base ($)</label><input required type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label><input required type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Hora</label><input required type="time" value={time} onChange={e => setTime(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} /></div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700">Agendar</button>
                </form>
            </div>
        </div>
      )}

      {paymentModalData.isOpen && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-down">
                     <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                         <h3 className="font-bold text-lg flex items-center gap-2"><CreditCard size={20}/> Gestión de Pago</h3>
                         <button onClick={() => setPaymentModalData({ ...paymentModalData, isOpen: false })} className="hover:bg-slate-700 p-1 rounded-full"><X size={20} /></button>
                     </div>
                     <div className="p-6 space-y-6">
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Item Actual</label>
                                 <select className={inputClass} value={paymentModalData.currentService} onChange={handleServiceChangeInPayment}>
                                     <option value="">{paymentModalData.currentService} (Actual)</option>
                                     {renderServiceOptions()}
                                 </select>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Precio ($)</label><input type="number" value={paymentModalData.currentPrice} onChange={e => setPaymentModalData(prev => ({ ...prev, currentPrice: parseFloat(e.target.value) || 0 }))} className={inputClass}/></div>
                                 <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descuento (%)</label><input type="number" value={paymentModalData.discountPercent} onChange={e => setPaymentModalData(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))} className={inputClass}/></div>
                             </div>
                         </div>
                         <div className="flex items-start gap-3 bg-purple-50 p-3 rounded-lg border border-purple-100">
                             <input type="checkbox" checked={paymentModalData.isNewClient} onChange={e => setPaymentModalData(prev => ({ ...prev, isNewClient: e.target.checked }))} className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"/>
                             <div><p className="font-bold text-purple-900 text-sm">Aplicar regla: Cliente Nuevo (25%)</p></div>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                             <button onClick={() => sendNotification('whatsapp')} className="bg-green-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-600 flex items-center justify-center gap-2"><MessageCircle size={20} /> Enviar WhatsApp</button>
                             <button onClick={() => sendNotification('email')} className="bg-blue-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-600 flex items-center justify-center gap-2"><Mail size={20} /> Enviar Correo</button>
                         </div>
                         <button onClick={() => { savePaymentAdjustments(); setPaymentModalData({ ...paymentModalData, isOpen: false }); }} className="w-full text-slate-500 text-sm hover:underline mt-2">Guardar cambios y cerrar</button>
                     </div>
                </div>
           </div>
      )}
    </div>
  );
};

export default AppointmentManager;
