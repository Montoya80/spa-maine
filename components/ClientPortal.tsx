
import React, { useState } from 'react';
import { Patient, Appointment, BusinessConfig } from '../types';
import { Calendar, Clock, LogOut, Plus, FileText, CheckCircle2, Image as ImageIcon, XCircle, AlertCircle, MapPin, Phone, MessageCircle, Mail, CreditCard, Copy } from 'lucide-react';

interface ClientPortalProps {
  patient: Patient;
  appointments: Appointment[];
  businessConfig: BusinessConfig;
  onLogout: () => void;
  onNewAppointment: () => void;
  onCancelAppointment?: (id: string) => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ patient, appointments, businessConfig, onLogout, onNewAppointment, onCancelAppointment }) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'history' | 'gallery'>('appointments');

  const myAppointments = appointments.filter(a => a.patientId === patient.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCancel = (id: string) => {
      if(confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
          if(onCancelAppointment) onCancelAppointment(id);
      }
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="flex items-center gap-4 w-full">
            <img src={patient.avatarUrl} alt={patient.fullName} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Hola, {patient.fullName.split(' ')[0]}</h1>
                <p className="text-sm md:text-base text-slate-500">Bienvenido a tu espacio personal.</p>
                <span className="inline-block mt-1 bg-primary-50 text-primary-700 text-xs font-bold px-2 py-1 rounded">
                    Código: {patient.clientCode}
                </span>
            </div>
         </div>
         <div className="flex gap-3 w-full md:w-auto">
             <button 
                onClick={onLogout}
                className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
             >
                 <LogOut size={18} /> Salir
             </button>
             <button 
                onClick={onNewAppointment}
                className="flex-1 md:flex-none px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold transition-colors shadow-lg shadow-primary-200 flex items-center justify-center gap-2 text-sm md:text-base"
             >
                 <Plus size={18} /> Nueva Cita
             </button>
         </div>
      </div>

      {/* Persistent Banking Details Card - Refactored Layout for Clarity */}
      {businessConfig.bankingInfo && (
          <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-6 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="relative z-10">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                      <CreditCard size={16} className="text-purple-600" /> Datos de Pago (Transferencias)
                  </h3>
                  
                  {/* Grid Layout for details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                      <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-400 font-bold uppercase">Banco</span>
                          <span className="font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block w-fit">
                              {businessConfig.bankingInfo.bankName}
                          </span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-400 font-bold uppercase">Cuenta</span>
                          <span className="font-mono font-medium text-slate-700 text-base break-all">
                              {businessConfig.bankingInfo.accountNumber}
                          </span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-400 font-bold uppercase">CLABE Interbancaria</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-medium text-slate-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-100 break-all">
                                {businessConfig.bankingInfo.clabe}
                            </span>
                            <button onClick={() => navigator.clipboard.writeText(businessConfig.bankingInfo?.clabe || '')} className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 p-1 rounded" title="Copiar"><Copy size={14}/></button>
                          </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-400 font-bold uppercase">Beneficiario / Titular</span>
                          <span className="font-semibold text-slate-700 uppercase leading-tight">
                              {businessConfig.bankingInfo.accountHolder}
                          </span>
                      </div>
                  </div>

                  <div className="mt-5 bg-purple-100 p-3 rounded-xl border border-purple-200 text-center flex flex-col sm:flex-row justify-center items-center gap-2">
                      <span className="text-xs text-purple-700 font-bold uppercase">Concepto de Pago (Obligatorio):</span>
                      <span className="font-mono font-black text-purple-900 text-sm md:text-base break-all">Abono {patient.clientCode}</span>
                  </div>
              </div>
          </div>
      )}

      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto pb-1 no-scrollbar">
         <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'appointments' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
             Mis Citas
         </button>
         <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'history' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
             Mi Expediente
         </button>
         <button 
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'gallery' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
             Mi Progreso
         </button>
      </div>

      {activeTab === 'appointments' && (
          <div className="space-y-4">
              {myAppointments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                      <Calendar className="mx-auto text-slate-300 mb-3" size={40} />
                      <p className="text-slate-500">No tienes citas registradas.</p>
                      <button onClick={onNewAppointment} className="mt-4 text-primary-600 font-bold hover:underline">Agendar ahora</button>
                  </div>
              ) : (
                  myAppointments.map(apt => (
                      <div key={apt.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4 w-full md:w-auto">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${apt.status === 'confirmed' ? 'bg-green-100 text-green-600' : apt.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {apt.time.split(':')[0]}
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-900">{apt.service}</h3>
                                  <div className="flex items-center gap-3 text-sm text-slate-500">
                                      <span className="flex items-center gap-1"><Calendar size={14} /> {apt.date}</span>
                                      <span className="flex items-center gap-1"><Clock size={14} /> {apt.time} hrs</span>
                                  </div>
                                  {apt.status === 'pending' && (
                                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><AlertCircle size={10} /> Esperando confirmación</p>
                                  )}
                              </div>
                          </div>
                          
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    apt.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
                                    apt.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                    'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}>
                                {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                            </span>
                            
                            {apt.status === 'pending' && onCancelAppointment && (
                                <button 
                                    onClick={() => handleCancel(apt.id)}
                                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                >
                                    <XCircle size={12} /> Cancelar
                                </button>
                            )}
                          </div>
                      </div>
                  ))
              )}
          </div>
      )}

      {activeTab === 'history' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="text-primary-500" /> Historial de Tratamientos
                  </h3>
                  <div className="space-y-4">
                       {patient.history.length === 0 ? (
                           <p className="text-slate-400 italic text-sm">Aún no tienes historial clínico.</p>
                       ) : (
                           patient.history.map(note => (
                               <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                   <div className="flex justify-between mb-2">
                                       <span className="font-bold text-slate-800">{note.treatment}</span>
                                       <span className="text-xs text-slate-400">{note.date}</span>
                                   </div>
                                   {note.productsUsed && note.productsUsed.length > 0 && (
                                       <div className="flex gap-2 flex-wrap mt-2">
                                           {note.productsUsed.map((p,i) => (
                                               <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded">{p}</span>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           ))
                       )}
                  </div>
              </div>
              
              <div>
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="text-amber-500" /> Recomendaciones
                  </h3>
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                      {patient.clinicRecommendations ? (
                          <p className="text-amber-900 leading-relaxed whitespace-pre-wrap">{patient.clinicRecommendations}</p>
                      ) : (
                          <p className="text-amber-700 italic opacity-70">Tu especialista agregará recomendaciones aquí pronto.</p>
                      )}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'gallery' && (
          <div>
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <ImageIcon className="text-purple-500" /> Mi Galería de Progreso
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(patient.progressPhotos || []).map(photo => (
                      <div key={photo.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="aspect-square bg-slate-100 relative">
                              <img src={photo.url} alt={photo.type} className="w-full h-full object-cover" />
                              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded text-white uppercase ${photo.type === 'before' ? 'bg-slate-600' : 'bg-primary-500'}`}>
                                  {photo.type === 'before' ? 'Antes' : 'Después'}
                              </span>
                          </div>
                          <div className="p-3">
                              <p className="text-xs text-slate-400 font-medium mb-1">{photo.date}</p>
                              {photo.notes && <p className="text-xs text-slate-700 truncate">{photo.notes}</p>}
                          </div>
                      </div>
                  ))}
                  {(!patient.progressPhotos || patient.progressPhotos.length === 0) && (
                      <div className="col-span-full py-10 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                          <ImageIcon className="mx-auto mb-2 opacity-50" />
                          <p>Aún no hay fotos de progreso en tu perfil.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Business Contact Footer */}
      <div className="mt-12 bg-slate-900 rounded-2xl p-6 md:p-8 text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-primary-500" /> Ubicación y Contacto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                  <div>
                      <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Dirección</h4>
                      <p className="text-base md:text-lg leading-relaxed">{businessConfig.contact.address}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-8">
                      <div>
                          <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Teléfono</h4>
                          <div className="flex items-center gap-2">
                              <Phone size={16} className="text-slate-300" />
                              <span>{businessConfig.contact.phone}</span>
                          </div>
                      </div>
                      <div>
                          <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">WhatsApp</h4>
                          <div className="flex items-center gap-2">
                              <MessageCircle size={16} className="text-green-500" />
                              <span>{businessConfig.contact.whatsapp}</span>
                          </div>
                      </div>
                  </div>
                   <div>
                      <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Email</h4>
                      <div className="flex items-center gap-2">
                          <Mail size={16} className="text-slate-300" />
                          <span>{businessConfig.contact.email}</span>
                      </div>
                  </div>
              </div>
              <div className="h-48 md:h-full bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                   {businessConfig.contact.mapUrl ? (
                        <iframe 
                            src={businessConfig.contact.mapUrl}
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Mapa de Ubicación"
                        ></iframe>
                   ) : (
                       <div className="flex items-center justify-center h-full text-slate-500 italic">
                           Mapa no disponible
                       </div>
                   )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default ClientPortal;
