
import React, { useState } from 'react';
import { Patient, TreatmentSuggestion, ClinicalNote, ProgressPhoto, Employee, Product } from '../types';
import { ArrowLeft, Sparkles, Clock, Calendar as CalIcon, Plus, Save, Edit2, X, Image as ImageIcon, Trash2, HeartPulse, StickyNote, Lock, UserCheck, Calendar, AlertTriangle } from 'lucide-react';
import { generateTreatmentSuggestion } from '../services/geminiService';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onDeletePatient: (id: string) => void;
  employees: Employee[]; 
  products: Product[];
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onUpdatePatient, onDeletePatient, employees, products }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'profile' | 'ai' | 'gallery'>('history');
  const [aiSuggestion, setAiSuggestion] = useState<TreatmentSuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConcern, setAiConcern] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Note Form State
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteTreatment, setNewNoteTreatment] = useState('');
  const [newNoteObs, setNewNoteObs] = useState('');

  // Gallery Form State
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [newPhotoDate, setNewPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPhotoType, setNewPhotoType] = useState<'before' | 'after'>('before');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoNotes, setNewPhotoNotes] = useState('');

  // Clinic Recommendation Edit State
  const [isEditingRecs, setIsEditingRecs] = useState(false);
  const [recommendations, setRecommendations] = useState(patient.clinicRecommendations || '');

  // Edit Patient State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Patient>(patient);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  const handleAiGenerate = async () => {
    if (!aiConcern.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const suggestion = await generateTreatmentSuggestion(patient, aiConcern);
      setAiSuggestion(suggestion);
    } catch (err: any) {
        if (err.message === "API_NOT_ENABLED") {
            setAiError("La API de Google no está habilitada en tu proyecto. Ve a Google Cloud Console y habilita 'Generative Language API'.");
        } else if (err.message === "API_KEY_MISSING") {
            setAiError("Falta la API Key en la configuración del sistema (.env).");
        } else {
            setAiError("Ocurrió un error al consultar la IA. Intenta de nuevo más tarde.");
        }
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddNote = () => {
    if (!newNoteTreatment || !newNoteObs) return;

    const newNote: ClinicalNote = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      treatment: newNoteTreatment,
      observations: newNoteObs,
      productsUsed: []
    };

    const updatedPatient = {
      ...patient,
      history: [newNote, ...patient.history]
    };

    onUpdatePatient(updatedPatient);
    setNewNoteTreatment('');
    setNewNoteObs('');
    setShowAddNote(false);
  };

  const cleanPhone = (p: string) => (p || '').replace(/\D/g, '');

  const handleSaveEdit = () => {
    if (cleanPhone(editForm.phone).length !== 10) {
        alert("Número incompleto. El teléfono debe tener exactamente 10 dígitos.");
        return;
    }
    if (cleanPhone(editForm.emergencyContact?.phone).length !== 10) {
        alert("Número incompleto. El teléfono de emergencia debe tener exactamente 10 dígitos.");
        return;
    }
    
    onUpdatePatient(editForm);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isProfile = false) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (isProfile) {
                  setEditForm({...editForm, avatarUrl: reader.result as string});
              } else {
                  setNewPhotoUrl(reader.result as string);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddPhoto = () => {
      if (!newPhotoUrl) return;
      const newPhoto: ProgressPhoto = {
          id: `ph-${Date.now()}`,
          date: newPhotoDate,
          type: newPhotoType,
          url: newPhotoUrl,
          notes: newPhotoNotes
      };
      const updatedPatient = {
          ...patient,
          progressPhotos: [newPhoto, ...(patient.progressPhotos || [])]
      };
      onUpdatePatient(updatedPatient);
      setShowAddPhoto(false);
      setNewPhotoUrl('');
      setNewPhotoNotes('');
  };

  const handleSaveRecs = () => {
      onUpdatePatient({
          ...patient,
          clinicRecommendations: recommendations
      });
      setIsEditingRecs(false);
  };

  // Common input class for edit mode to ensure visibility
  const inputClass = "w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow shadow-sm";

  return (
    <div className="animate-fade-in pb-10">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={18} className="mr-1" /> Volver a lista
      </button>

      {/* Header Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 relative overflow-hidden">
        {patient.registeredBy && !isEditing && (
            <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                <UserCheck size={12} /> Registrado por: {patient.registeredBy}
            </div>
        )}

        {isEditing ? (
             <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">Editar Información del Cliente</h2>
                    <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"><X size={20}/></button>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200">
                        <img src={editForm.avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cambiar Foto</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, true)} className="text-sm text-slate-500" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                        <input className={inputClass} value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Nacimiento</label>
                        <input type="date" className={inputClass} value={editForm.birthDate} onChange={e => setEditForm({...editForm, birthDate: e.target.value})} style={{ colorScheme: 'light' }} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                        <input className={inputClass} value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono (10 dígitos)</label>
                        <input className={inputClass} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} maxLength={10} />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Piel</label>
                        <select className={inputClass} value={editForm.skinType} onChange={e => setEditForm({...editForm, skinType: e.target.value})}>
                            <option value="Por definir">Por definir</option>
                            <option value="Seca">Seca</option>
                            <option value="Grasa">Grasa</option>
                            <option value="Mixta">Mixta</option>
                            <option value="Normal">Normal</option>
                            <option value="Sensible">Sensible</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alergias</label>
                        <input className={inputClass} value={editForm.allergies} onChange={e => setEditForm({...editForm, allergies: e.target.value})} />
                    </div>
                    
                    {/* Admin Fields for Reassignment */}
                    <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2 bg-blue-50 p-4 rounded-xl">
                         <span className="text-xs font-bold text-blue-700 uppercase mb-2 block flex items-center gap-2">
                             <UserCheck size={12} /> Datos Administrativos
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-blue-600 mb-1 font-semibold">Registrado Por</label>
                                <select 
                                    className={inputClass} 
                                    value={editForm.registeredBy || ''} 
                                    onChange={e => setEditForm({...editForm, registeredBy: e.target.value})}
                                >
                                    <option value="">Sistema / Desconocido</option>
                                    <option value="Portal Web">Portal Web</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.fullName}>{emp.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-blue-600 mb-1 font-semibold">Asignar Terapeuta</label>
                                <select 
                                    className={inputClass} 
                                    value={editForm.assignedTherapist || ''} 
                                    onChange={e => setEditForm({...editForm, assignedTherapist: e.target.value})}
                                >
                                    <option value="">Sin Asignar</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.fullName}>{emp.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-blue-600 mb-1 font-semibold">Fecha de Alta</label>
                                <input 
                                    type="date" 
                                    className={inputClass} 
                                    value={editForm.registrationDate || ''} 
                                    onChange={e => setEditForm({...editForm, registrationDate: e.target.value})} 
                                    style={{ colorScheme: 'light' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2 bg-slate-50 p-4 rounded-xl">
                        <span className="text-xs font-bold text-slate-400 uppercase mb-2 block flex items-center gap-2">
                             <Lock size={12} /> Gestión de Acceso
                        </span>
                        <div>
                             <label className="block text-xs text-slate-500 mb-1">Contraseña Actual</label>
                             <div className="flex gap-2">
                                <input className={inputClass} value={editForm.password || ''} onChange={e => setEditForm({...editForm, password: e.target.value})} type="text" placeholder="Asignar contraseña" />
                                <span className="text-xs text-amber-600 flex items-center">
                                    <span className="bg-amber-100 px-2 py-1 rounded">Visible para Admin</span>
                                </span>
                             </div>
                             <p className="text-[10px] text-slate-400 mt-1">Puedes resetear la contraseña del cliente aquí si la olvidó.</p>
                        </div>
                    </div>

                    <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                        <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Contacto de Emergencia</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Nombre</label>
                                <input className={inputClass} value={editForm.emergencyContact.name} onChange={e => setEditForm({...editForm, emergencyContact: {...editForm.emergencyContact, name: e.target.value}})} />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Teléfono (10 dígitos)</label>
                                <input className={inputClass} value={editForm.emergencyContact.phone} onChange={e => setEditForm({...editForm, emergencyContact: {...editForm.emergencyContact, phone: e.target.value}})} maxLength={10} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-100 bg-red-50 rounded-xl p-4 mt-6">
                    <h4 className="text-red-800 font-bold mb-2 text-sm flex items-center gap-2"><Trash2 size={16}/> Zona de Peligro</h4>
                    <div className="flex justify-between items-center">
                        <p className="text-red-600 text-xs">Esta acción eliminará permanentemente al cliente y su historial.</p>
                        <button 
                            type="button" 
                            onClick={() => onDeletePatient(patient.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                        >
                            Eliminar Cliente
                        </button>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">Cancelar</button>
                    <button onClick={handleSaveEdit} className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-colors">Guardar Cambios</button>
                </div>
             </div>
        ) : (
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <img 
                src={patient.avatarUrl} 
                alt={patient.fullName} 
                className="w-24 h-24 rounded-2xl object-cover shadow-md ring-4 ring-slate-50"
                />
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{patient.fullName}</h1>
                            <div className="flex items-center gap-3 text-sm font-mono text-slate-500">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold" title="Código de Cliente (Público)">{patient.clientCode}</span>
                                <span className="text-slate-300">|</span>
                                <span title="Número de Expediente (Interno)">Exp: #{patient.fileNumber}</span>
                            </div>
                        </div>
                        <button onClick={() => { setEditForm(patient); setIsEditing(true); }} className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium" title="Editar Perfil">
                            <Edit2 size={16} /> <span className="hidden sm:inline">Editar</span>
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 md:gap-3 text-sm mb-3 mt-4">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium whitespace-nowrap">
                        {calculateAge(patient.birthDate)} años
                        </span>
                        <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-medium whitespace-nowrap">
                        Piel {patient.skinType}
                        </span>
                        {patient.assignedTherapist && (
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium whitespace-nowrap border border-blue-100 flex items-center gap-1">
                                <UserCheck size={12}/> {patient.assignedTherapist}
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-slate-500 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <span className="flex items-center gap-1"><span className="font-semibold text-slate-700">Tel:</span> {patient.phone}</span>
                        <span className="hidden sm:inline text-slate-300">|</span>
                        <span className="flex items-center gap-1"><span className="font-semibold text-slate-700">Alta:</span> {patient.registrationDate || 'N/A'}</span>
                    </div>
                </div>
                <div className="w-full md:w-auto mt-4 md:mt-0">
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles size={18} />
                        Asistente IA
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'history' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Historial Clínico
        </button>
        <button 
          onClick={() => setActiveTab('gallery')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'gallery' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Galería y Avances
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'ai' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Análisis IA
        </button>
      </div>

      {/* Content */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Visitas y Tratamientos</h3>
                    <button 
                    onClick={() => setShowAddNote(!showAddNote)}
                    className="text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} /> Agregar Nota
                    </button>
                </div>

                {showAddNote && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-slide-down">
                        <h4 className="font-semibold text-slate-800 mb-4">Nueva Nota Clínica</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tratamiento Realizado</label>
                                <input 
                                    value={newNoteTreatment}
                                    onChange={(e) => setNewNoteTreatment(e.target.value)}
                                    className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-200 outline-none text-slate-900" 
                                    placeholder="Ej: Peeling Químico Suave"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Observaciones</label>
                                <textarea 
                                    value={newNoteObs}
                                    onChange={(e) => setNewNoteObs(e.target.value)}
                                    className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-200 outline-none h-24 resize-none text-slate-900" 
                                    placeholder="Reacción de la piel, recomendaciones dadas..."
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => setShowAddNote(false)}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleAddNote}
                                    disabled={!newNoteTreatment || !newNoteObs}
                                    className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save size={16} /> Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {patient.history.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
                            <CalIcon size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No hay historial clínico registrado.</p>
                        </div>
                    ) : (
                        patient.history.map((note) => (
                        <div key={note.id} className="relative pl-8 pb-8 border-l-2 border-slate-200 last:border-0 last:pb-0">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary-500"></div>
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900">{note.treatment}</h4>
                                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                        <Clock size={12} /> {note.date}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{note.observations}</p>
                                {note.productsUsed && note.productsUsed.length > 0 && (
                                    <div className="mt-3 flex gap-2 flex-wrap">
                                        {note.productsUsed.map((prod, idx) => (
                                            <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                {prod}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Right Side: Recommendations */}
            <div className="space-y-6">
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                    <div className="flex justify-between items-start mb-3">
                         <h3 className="font-bold text-amber-800 flex items-center gap-2">
                            <StickyNote size={18} /> Recomendaciones
                         </h3>
                         <button onClick={() => setIsEditingRecs(!isEditingRecs)} className="text-amber-600 hover:text-amber-800">
                             {isEditingRecs ? <X size={16} /> : <Edit2 size={16} />}
                         </button>
                    </div>
                    {isEditingRecs ? (
                        <div>
                             <textarea 
                                value={recommendations}
                                onChange={e => setRecommendations(e.target.value)}
                                className="w-full p-3 bg-white rounded-lg border border-amber-200 text-amber-900 focus:ring-2 focus:ring-amber-300 outline-none h-40 resize-none text-sm" 
                                placeholder="Escribe aquí las recomendaciones para el cliente..."
                            />
                            <button onClick={handleSaveRecs} className="mt-2 w-full bg-amber-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-amber-700">Guardar</button>
                        </div>
                    ) : (
                        <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                            {patient.clinicRecommendations || "No hay recomendaciones asignadas aún."}
                        </p>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Rest of the component (Gallery and AI Tabs) remain same... */}
      {activeTab === 'gallery' && (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900">Progreso Visual</h3>
                  <button onClick={() => setShowAddPhoto(true)} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-900 flex items-center gap-2">
                      <Plus size={16} /> Subir Foto
                  </button>
              </div>

              {showAddPhoto && (
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-slide-down max-w-lg mx-auto">
                        <h4 className="font-bold text-slate-800 mb-4">Nueva Foto de Progreso</h4>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Imagen</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 bg-white p-2 rounded-lg border border-slate-300"/>
                             </div>
                             {newPhotoUrl && (
                                 <div className="h-32 w-full bg-slate-200 rounded-lg overflow-hidden">
                                     <img src={newPhotoUrl} className="w-full h-full object-contain" />
                                 </div>
                             )}
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                                    <input type="date" value={newPhotoDate} onChange={e => setNewPhotoDate(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                                    <select value={newPhotoType} onChange={e => setNewPhotoType(e.target.value as any)} className={inputClass}>
                                        <option value="before">Antes</option>
                                        <option value="after">Después</option>
                                    </select>
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas</label>
                                <input value={newPhotoNotes} onChange={e => setNewPhotoNotes(e.target.value)} className={inputClass} placeholder="Descripción breve..." />
                             </div>
                             <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setShowAddPhoto(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg text-sm font-medium">Cancelar</button>
                                <button onClick={handleAddPhoto} className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">Guardar</button>
                             </div>
                        </div>
                  </div>
              )}

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
                          No hay fotos de progreso.
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                    <h3 className="font-bold text-indigo-900 text-lg mb-2 flex items-center gap-2">
                        <Sparkles className="text-indigo-600" size={20} />
                        Consultar al Asistente
                    </h3>
                    <p className="text-indigo-700 text-sm mb-4">
                        Describe la condición actual de la piel o el objetivo del paciente. La IA analizará el perfil y sugerirá un protocolo.
                    </p>
                    <textarea 
                        className="w-full p-4 rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-indigo-300 text-slate-900 mb-4 h-32 resize-none placeholder:text-slate-400 bg-white"
                        placeholder="Ej: El paciente presenta brotes de acné en la barbilla y piel deshidratada por el cambio de clima..."
                        value={aiConcern}
                        onChange={(e) => setAiConcern(e.target.value)}
                    />
                    
                    {/* Error Display */}
                    {aiError && (
                        <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-4 flex items-start gap-2">
                            <AlertTriangle className="shrink-0" size={18} />
                            <span>{aiError}</span>
                        </div>
                    )}

                    <button 
                        onClick={handleAiGenerate}
                        disabled={aiLoading || !aiConcern}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {aiLoading ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Analizando...</>
                        ) : (
                            'Generar Recomendación'
                        )}
                    </button>
                </div>
            </div>

            <div>
                {aiSuggestion ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-indigo-50 overflow-hidden animate-fade-in">
                        <div className="bg-indigo-600 px-6 py-4">
                            <h3 className="text-white font-bold text-lg">Plan Sugerido</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-xs uppercase font-bold text-slate-400 mb-2">Protocolo</h4>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{aiSuggestion.plan}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-xs uppercase font-bold text-slate-400 mb-2">Productos Clave</h4>
                                <div className="flex flex-wrap gap-2">
                                    {aiSuggestion.products.map((p, i) => (
                                        <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium border border-indigo-100">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <h4 className="text-xs uppercase font-bold text-amber-600 mb-1">Consejo Lifestyle</h4>
                                <p className="text-amber-800 text-sm italic">"{aiSuggestion.lifestyleAdvice}"</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl p-10 min-h-[300px]">
                        <Sparkles size={48} className="mb-4 opacity-50" />
                        <p className="font-medium">Los resultados aparecerán aquí</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
