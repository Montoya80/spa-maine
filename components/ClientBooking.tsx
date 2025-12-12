import React, { useState, useEffect } from 'react';
import { Appointment, Patient, Service, Promotion, BusinessConfig, Product } from '../types';
import { Calendar, CheckCircle2, ChevronRight, User, Mail, Phone, Sparkles, Tag, Info, AlertTriangle, HeartPulse, MapPin, MessageCircle, Image as ImageIcon, LogIn, Lock, KeyRound, Eye, EyeOff, Star, CreditCard, Copy, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';
import { generateWhatsAppLink, generateMailtoLink, getPasswordRecoveryMessage } from '../services/notificationService';

interface ClientBookingProps {
  existingAppointments: Appointment[];
  allPatients: Patient[]; 
  services: Service[];
  promotions: Promotion[];
  products?: Product[];
  businessConfig: BusinessConfig;
  onBookAppointment: (appointment: Appointment, appointmentPatient: Patient) => void;
  onClientLogin?: (patient: Patient) => void;
  currentUser?: Patient | null; 
  onBack?: () => void; 
}

const ClientBooking: React.FC<ClientBookingProps> = ({ 
    existingAppointments, 
    allPatients,
    services, 
    promotions,
    products = [],
    businessConfig,
    onBookAppointment,
    onClientLogin,
    currentUser,
    onBack
}) => {
  const [step, setStep] = useState(1);
  const [selectionType, setSelectionType] = useState<'service' | 'promo' | 'product'>('service');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [catalogTab, setCatalogTab] = useState<'treatments' | 'promos' | 'products'>('treatments');

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Identity State
  const [foundClient, setFoundClient] = useState<Patient | null>(null);
  
  // New User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergName, setEmergName] = useState('');
  const [emergPhone, setEmergPhone] = useState('');
  
  // Security
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Success State
  const [isSuccess, setIsSuccess] = useState(false);
  const [successPatientData, setSuccessPatientData] = useState<Patient | null>(null);

  useEffect(() => {
      if (currentUser) {
          setFoundClient(currentUser);
          setName(currentUser.fullName);
          setEmail(currentUser.email);
          setPhone(currentUser.phone);
          setBirthDate(currentUser.birthDate);
          setAllergies(currentUser.allergies);
          setEmergName(currentUser.emergencyContact?.name || '');
          setEmergPhone(currentUser.emergencyContact?.phone || '');
      }
  }, [currentUser]);

  const activeServices = services.filter(s => s.active);
  const activePromos = promotions.filter(p => p.active);
  const activeProducts = products.filter(p => p.active && p.stock > 0 && p.categoryType === 'retail');

  const getSelectedItem = () => {
      if (selectionType === 'service') return services.find(s => s.id === selectedItemId);
      if (selectionType === 'promo') return promotions.find(p => p.id === selectedItemId);
      if (selectionType === 'product') return products.find(p => p.id === selectedItemId);
      return null;
  };

  const selectedItem = getSelectedItem();
  
  const getItemPrice = () => {
      if (!selectedItem) return 0;
      if ('price' in selectedItem && selectedItem.price) return selectedItem.price;
      return 0;
  };

  const getItemName = () => {
      if (!selectedItem) return '';
      if ('name' in selectedItem) return selectedItem.name;
      if ('title' in selectedItem) return selectedItem.title;
      return '';
  };

  const today = new Date().toISOString().split('T')[0];
  const generateClientCode = (nameStr: string) => { const initials = nameStr.split(' ').map(n => n[0]).join('').substring(0,3).toUpperCase(); const random = Math.floor(10000 + Math.random() * 90000); return `${initials}${random}`; };
  const getNextFileNumber = () => { return (100 + allPatients.length).toString().padStart(4, '0'); };
  
  // Scheduling Logic
  const getDayConfig = (dateStr: string) => { const date = new Date(dateStr + 'T12:00:00'); return businessConfig.schedule.find(d => d.dayOfWeek === date.getDay()); };
  const generateTimeSlots = (dateStr: string) => { 
      const dayConfig = getDayConfig(dateStr); if (!dayConfig || !dayConfig.isOpen) return [];
      const slots = []; const startHour = parseInt(dayConfig.openTime.split(':')[0]); const endHour = parseInt(dayConfig.closeTime.split(':')[0]);
      for (let i = startHour; i < endHour; i++) slots.push(`${i.toString().padStart(2, '0')}:00`);
      return slots;
  };
  const isDateBlocked = (dateStr: string) => businessConfig.blockedDates.includes(dateStr);
  const checkAvailability = (dateStr: string, time: string) => { 
      const slotKey = `${dateStr} ${time}`; if (businessConfig.blockedSlots.includes(slotKey)) return false;
      return !existingAppointments.some(apt => apt.date === dateStr && apt.time === time && apt.status !== 'cancelled');
  };
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];
  const dayConfig = selectedDate ? getDayConfig(selectedDate) : null;
  const isDayBlocked = selectedDate && isDateBlocked(selectedDate);
  const isDayClosed = selectedDate && dayConfig && !dayConfig.isOpen;
  
  const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    // Validation
    if (!name || !email || !phone || !birthDate || !emergName || !emergPhone) { alert("Por favor completa todos los campos obligatorios."); return; }
    if (cleanPhone(phone).length !== 10) { alert("El teléfono personal debe tener 10 dígitos."); return; }
    if (cleanPhone(emergPhone).length !== 10) { alert("El teléfono de emergencia debe tener 10 dígitos."); return; }

    // New Client Credential Validation
    if (!foundClient && !currentUser) {
        if (regPassword.length < 4) { alert("La contraseña debe tener al menos 4 caracteres."); return; }
        if (regPassword !== regConfirmPassword) { alert("Las contraseñas no coinciden."); return; }
    }

    let patientId = foundClient ? foundClient.id : (currentUser ? currentUser.id : `p-${Date.now()}`);
    let clientCode = foundClient ? foundClient.clientCode : (currentUser ? currentUser.clientCode : generateClientCode(name));
    let fileNumber = foundClient ? foundClient.fileNumber : (currentUser ? currentUser.fileNumber : getNextFileNumber());

    const finalPatient: Patient = {
      id: patientId, clientCode, fileNumber, fullName: name, email: email, phone: phone,
      password: (foundClient || currentUser) ? (foundClient?.password || currentUser?.password) : regPassword, // SAVE CREDENTIAL
      birthDate: birthDate, skinType: (foundClient || currentUser)?.skinType || 'Por definir', allergies: allergies || 'Ninguna',
      emergencyContact: { name: emergName, phone: emergPhone },
      avatarUrl: (foundClient || currentUser)?.avatarUrl || `https://picsum.photos/200/200?random=${Date.now()}`,
      history: (foundClient || currentUser)?.history || [],
      progressPhotos: (foundClient || currentUser)?.progressPhotos || [],
      clinicRecommendations: (foundClient || currentUser)?.clinicRecommendations || '',
      registrationDate: (foundClient || currentUser)?.registrationDate || new Date().toISOString().split('T')[0],
      assignedTherapist: (foundClient || currentUser)?.assignedTherapist || '',
      registeredBy: (foundClient || currentUser)?.registeredBy || 'Portal Web'
    };

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: finalPatient.id,
      patientName: name,
      date: selectedDate,
      time: selectedTime,
      service: getItemName(),
      price: getItemPrice(),
      status: 'pending'
    };

    onBookAppointment(newAppointment, finalPatient);
    setSuccessPatientData(finalPatient);
    setIsSuccess(true);
  };

  const handleReturnAction = () => {
      if (onBack) { onBack(); } else { setIsSuccess(false); setStep(1); setSuccessPatientData(null); }
  };

  if (isSuccess && selectedItem) {
      const totalAmount = getItemPrice();
      const depositAmount = totalAmount * 0.25;
      const isNewClient = !foundClient && !currentUser;
      const requireDeposit = isNewClient; 

      return (
          <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto my-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6"><CheckCircle2 size={40} /></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Solicitud Recibida!</h2>
              {isNewClient && <p className="text-sm font-bold text-teal-600 mb-2 bg-teal-50 px-3 py-1 rounded-full animate-pulse">¡Tu cuenta ha sido creada exitosamente!</p>}
              <p className="text-slate-600 mb-6">Tu reserva para <strong>{getItemName()}</strong> está en espera.</p>
              {requireDeposit ? (
                  <div className="w-full bg-purple-50 border border-purple-100 rounded-xl p-6 text-left mb-6">
                      <h4 className="font-bold text-purple-900">Anticipo Requerido (25%): ${depositAmount.toFixed(2)}</h4>
                      <p className="text-xs text-purple-700 mt-1">Realiza tu pago para confirmar. Concepto: <strong>Abono {successPatientData?.clientCode}</strong></p>
                      {businessConfig.bankingInfo && (
                          <div className="mt-4 text-sm text-slate-700 bg-white p-4 rounded border border-purple-100">
                              <p><strong>Banco:</strong> {businessConfig.bankingInfo.bankName}</p>
                              <p><strong>Cuenta:</strong> {businessConfig.bankingInfo.accountNumber}</p>
                              <p><strong>CLABE:</strong> {businessConfig.bankingInfo.clabe}</p>
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 text-left mb-6"><p className="text-blue-800 text-sm">Puedes pagar el día de tu cita. Ref: Abono {successPatientData?.clientCode}</p></div>
              )}
              
              <div className="flex flex-col md:flex-row gap-4 justify-center w-full mt-4">
                  {onClientLogin && successPatientData ? (
                      <button 
                        onClick={() => onClientLogin(successPatientData)} 
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2"
                      >
                          Acceder a mi Cuenta <ChevronRight size={18} />
                      </button>
                  ) : (
                      <button onClick={handleReturnAction} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg">
                          Volver al Inicio
                      </button>
                  )}
                  
                  {onBack && (
                      <button onClick={onBack} className="text-slate-500 font-bold hover:underline px-4 py-3">
                          Volver
                      </button>
                  )}
              </div>
          </div>
      );
  }

  const inputClass = "w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Reserva tu Experiencia</h2>
        <p className="text-slate-500 text-lg">Maine SPA Center - Bienestar Integral</p>
      </div>

      {!currentUser && ( <div className="mb-8 text-center text-slate-400"> (Inicia sesión para autocompletar tus datos) </div> )}

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 mb-10 overflow-hidden">
        {step === 1 && (
          <div className="p-6 md:p-8 animate-slide-down">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="text-primary-500" /> ¿Qué deseas reservar?
            </h3>
            
            <div className="flex border-b border-slate-200 mb-6">
                <button onClick={() => setCatalogTab('treatments')} className={`flex-1 py-3 font-bold text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${catalogTab === 'treatments' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Sparkles size={16} /> Tratamientos</button>
                <button onClick={() => setCatalogTab('promos')} className={`flex-1 py-3 font-bold text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${catalogTab === 'promos' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Tag size={16} /> Promociones</button>
                <button onClick={() => setCatalogTab('products')} className={`flex-1 py-3 font-bold text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${catalogTab === 'products' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><ShoppingBag size={16} /> Productos</button>
            </div>

            <div className="min-h-[300px]">
                {catalogTab === 'treatments' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {activeServices.map((srv) => (
                            <button key={srv.id} onClick={() => { setSelectedItemId(srv.id); setSelectionType('service'); setStep(2); }} className={`p-4 rounded-xl border text-left transition-all hover:shadow-md flex justify-between items-center group ${selectedItemId === srv.id && selectionType === 'service' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-200 hover:border-primary-300 bg-white'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">{srv.imageUrl ? <img src={srv.imageUrl} className="w-full h-full object-cover"/> : <Sparkles className="m-3 text-slate-400"/>}</div>
                                <div><span className="font-semibold text-slate-800 block">{srv.name}</span><span className="text-xs text-slate-500">{srv.duration} min</span></div>
                            </div>
                            <span className="font-bold text-lg group-hover:text-primary-600 text-slate-400">${srv.price}</span>
                            </button>
                        ))}
                    </div>
                )}
                {catalogTab === 'promos' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {activePromos.map(promo => (
                            <button key={promo.id} onClick={() => { setSelectedItemId(promo.id); setSelectionType('promo'); setStep(2); }} className={`relative overflow-hidden rounded-xl border text-left transition-all hover:shadow-md group h-32 ${selectedItemId === promo.id && selectionType === 'promo' ? 'ring-2 ring-pink-500' : 'border-slate-200'}`}>
                                <div className={`absolute inset-0 opacity-10 ${promo.color}`}></div>
                                <div className="p-5 flex flex-col justify-between h-full relative z-10">
                                    <div className="flex justify-between items-start"><h4 className="font-bold text-slate-800">{promo.title}</h4><span className={`text-[10px] text-white px-2 py-1 rounded font-bold ${promo.color}`}>{promo.discountText}</span></div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{promo.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                {catalogTab === 'products' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {activeProducts.map(prod => (
                            <button key={prod.id} onClick={() => { setSelectedItemId(prod.id); setSelectionType('product'); setStep(2); }} className={`p-4 rounded-xl border text-left transition-all hover:shadow-md flex justify-between items-center group ${selectedItemId === prod.id && selectionType === 'product' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-300 bg-white'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">{prod.imageUrl ? <img src={prod.imageUrl} className="w-full h-full object-cover"/> : <ShoppingBag className="m-3 text-slate-400"/>}</div>
                                    <div><span className="font-semibold text-slate-800 block">{prod.name}</span><span className="text-xs text-slate-500 line-clamp-1">{prod.category || 'General'}</span></div>
                                </div>
                                <div className="text-right"><span className="font-bold text-lg block group-hover:text-purple-600 text-slate-400">${prod.price}</span>{prod.stock < 5 && <span className="text-[10px] text-red-500 font-bold">¡Pocos!</span>}</div>
                            </button>
                        ))}
                        {activeProducts.length === 0 && (
                            <p className="text-slate-400 italic text-center col-span-2 py-4">No hay productos de venta disponibles.</p>
                        )}
                    </div>
                )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 md:p-8 animate-slide-down">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Calendar className="text-primary-500" /> {selectionType === 'product' ? 'Fecha de Recolección' : 'Fecha de Cita'}</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Selecciona un día</label>
                    <input type="date" min={today} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }} className={inputClass} style={{ colorScheme: 'light' }} />
                </div>
                {selectedDate && (
                    <div className="animate-fade-in">
                        {(isDayBlocked || isDayClosed) ? (
                            <div className="p-6 bg-red-50 rounded-xl text-center text-red-700 font-semibold">No disponible</div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {timeSlots.map(time => {
                                    const isAvailable = checkAvailability(selectedDate, time);
                                    return <button key={time} disabled={!isAvailable} onClick={() => setSelectedTime(time)} className={`py-3 px-1 rounded-xl text-sm font-bold border transition-all ${!isAvailable ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : selectedTime === time ? 'bg-primary-600 text-white' : 'bg-white hover:border-primary-400'}`}>{time}</button>;
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 items-center">
                <button onClick={() => setStep(1)} className="text-slate-500 font-medium px-4 py-2 rounded-lg hover:bg-slate-50">Atrás</button>
                <button disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50">Continuar</button>
            </div>
          </div>
        )}

        {step === 3 && (
            <div className="p-6 md:p-8 animate-slide-down">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><User className="text-primary-500" /> Tus Datos</h3>
                
                {!foundClient && !currentUser && (
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-xl mb-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-teal-500 p-2 rounded-full"><ShieldCheck size={20} className="text-white"/></div>
                            <h4 className="font-bold text-lg">Crea tu Cuenta</h4>
                        </div>
                        <p className="text-slate-300 text-sm mb-0">Para agendar, necesitamos crear tu perfil. <br/>Tus credenciales de acceso serán tu <strong>Teléfono</strong> y <strong>Contraseña</strong>.</p>
                    </div>
                )}

                <form onSubmit={handleBook} className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Maria Perez" className={inputClass} readOnly={!!foundClient || !!currentUser} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Nacimiento</label>
                                <input required type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} readOnly={!!foundClient || !!currentUser} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono Móvil (Tu Usuario)</label>
                                <input required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="10 dígitos" maxLength={10} readOnly={!!foundClient || !!currentUser} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className={inputClass} readOnly={!!foundClient || !!currentUser} />
                        </div>

                        {/* NEW USER CREDENTIALS BLOCK */}
                        {!foundClient && !currentUser && (
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-2">
                                <h4 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                                    <KeyRound size={16} className="text-primary-600"/> Crea tus Credenciales de Acceso
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Contraseña (Mín 4 caracteres)</label>
                                        <div className="relative">
                                            <input required type={showRegPassword ? "text" : "password"} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Crear contraseña" className={`${inputClass} pr-10`} />
                                            <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Confirmar Contraseña</label>
                                        <div className="relative">
                                            <input required type={showConfirmPassword ? "text" : "password"} value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} placeholder="Repetir contraseña" className={`${inputClass} pr-10`} />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Información Médica</label>
                        <input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="¿Tienes alguna alergia?" className={inputClass} readOnly={!!foundClient || !!currentUser}/>
                         
                         <label className="block text-xs font-bold text-slate-500 uppercase mt-2">Contacto de Emergencia</label>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><input required value={emergName} onChange={e => setEmergName(e.target.value)} className={inputClass} placeholder="Nombre Contacto" readOnly={!!foundClient || !!currentUser} /></div>
                             <div><input required value={emergPhone} onChange={e => setEmergPhone(e.target.value)} className={inputClass} placeholder="Teléfono Contacto" maxLength={10} readOnly={!!foundClient || !!currentUser} /></div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 items-center">
                        <button type="button" onClick={() => setStep(2)} className="text-slate-500 font-medium px-4 py-2 rounded-lg hover:bg-slate-50">Atrás</button>
                        <button type="submit" className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 shadow-lg flex items-center gap-2">
                            {(!foundClient && !currentUser) ? 'Registrarme y Confirmar Cita' : 'Confirmar Cita'}
                        </button>
                    </div>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default ClientBooking;