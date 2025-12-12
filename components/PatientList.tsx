
import React, { useState, useEffect } from 'react';
import { Patient, Employee } from '../types';
import { Search, Plus, ChevronRight, X, User, Phone, Calendar, HeartPulse, Image as ImageIcon, Trash2, Lock, Eye, EyeOff } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  startOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  currentUser: Employee; 
  canDelete: boolean; 
}

const PatientList: React.FC<PatientListProps> = ({ 
  patients, 
  onSelectPatient, 
  onAddPatient,
  onDeletePatient,
  startOpen = false,
  onOpenChange,
  currentUser,
  canDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    if (startOpen) {
      setShowModal(true);
    }
  }, [startOpen]);

  const handleModalClose = () => {
    setShowModal(false);
    if (onOpenChange) onOpenChange(false);
  };
  
  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newAllergies, setNewAllergies] = useState('');
  const [newEmergName, setNewEmergName] = useState('');
  const [newEmergPhone, setNewEmergPhone] = useState('');
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  
  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const generateClientCode = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0,3).toUpperCase();
    const random = Math.floor(10000 + Math.random() * 90000); 
    return `${initials}${random}`;
  };

  const getNextFileNumber = () => {
    const count = patients.length;
    return (100 + count).toString().padStart(4, '0');
  };

  // Fixed: Relaxed password validation (Min 8 chars, at least 1 number, 1 uppercase)
  const validatePassword = (pwd: string) => {
      const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      return regex.test(pwd);
  };

  const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Phone (Must be 10 digits)
    if (cleanPhone(newPhone).length !== 10) {
        alert("El número de teléfono debe tener exactamente 10 dígitos.");
        return;
    }

    if (cleanPhone(newEmergPhone).length !== 10) {
        alert("El teléfono de emergencia debe tener exactamente 10 dígitos.");
        return;
    }

    if (!validatePassword(newPassword)) {
        alert("La contraseña debe tener al menos 8 caracteres, incluir una mayúscula y un número.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    const newPatient: Patient = {
        id: `p${Date.now()}`,
        clientCode: generateClientCode(newName),
        fileNumber: getNextFileNumber(),
        fullName: newName,
        email: newEmail,
        password: newPassword,
        phone: newPhone,
        birthDate: newBirthDate,
        skinType: 'Por definir',
        allergies: newAllergies || 'Ninguna',
        emergencyContact: {
            name: newEmergName,
            phone: newEmergPhone
        },
        avatarUrl: newAvatar || `https://picsum.photos/200/200?random=${Date.now()}`,
        history: [],
        progressPhotos: [],
        clinicRecommendations: '',
        registeredBy: currentUser.fullName, // Track employee who registered
        registrationDate: new Date().toISOString().split('T')[0], // Track date automatically
        assignedTherapist: '' // Default empty
    };
    
    onAddPatient(newPatient);
    handleModalClose();
    
    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setNewPhone('');
    setNewBirthDate('');
    setNewAllergies('');
    setNewEmergName('');
    setNewEmergPhone('');
    setNewAvatar(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const inputClass = "w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-200 outline-none bg-white text-slate-900 placeholder:text-slate-400";

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clientes</h2>
          <p className="text-slate-500">Gestión de expedientes, registro y contraseñas.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
        >
          <Plus size={18} />
          Registrar Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email o Código de Cliente..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary-300 focus:ring-4 focus:ring-primary-50 transition-all outline-none text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          <div className="grid grid-cols-12 px-4 py-2 bg-slate-50 text-xs font-bold text-slate-400 uppercase hidden md:grid">
             <div className="col-span-4">Cliente</div>
             <div className="col-span-2">Código</div>
             <div className="col-span-3">Registro / Asignación</div>
             <div className="col-span-2">Fecha Alta</div>
             <div className="col-span-1 text-right">Acciones</div>
          </div>
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id}
              className="px-4 py-4 hover:bg-slate-50 transition-colors cursor-pointer grid grid-cols-1 md:grid-cols-12 items-center gap-4 group"
              onClick={() => onSelectPatient(patient)}
            >
              <div className="md:col-span-4 flex items-center gap-4">
                <img 
                  src={patient.avatarUrl} 
                  alt={patient.fullName} 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{patient.fullName}</h3>
                  <p className="text-xs text-slate-500 md:hidden">{patient.email}</p>
                </div>
              </div>
              
              <div className="md:col-span-2 flex items-center">
                  <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs font-bold font-mono">
                      {patient.clientCode}
                  </span>
              </div>

              <div className="md:col-span-3 hidden md:block">
                  <p className="text-xs text-slate-400 mb-0.5">Reg: {patient.registeredBy || 'Sistema'}</p>
                  <p className="text-xs font-bold text-slate-600">Asig: {patient.assignedTherapist || 'Sin asignar'}</p>
              </div>

              <div className="md:col-span-2 hidden md:block text-slate-500 text-sm">
                  {patient.registrationDate || 'Desconocida'}
              </div>

              <div className="md:col-span-1 flex justify-end items-center gap-2">
                {canDelete && (
                  <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          onDeletePatient(patient.id);
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                      <Trash2 size={18} />
                  </button>
                )}
                <ChevronRight size={20} className="text-slate-300 group-hover:text-primary-400" />
              </div>
            </div>
          ))}
          
          {filteredPatients.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-400">No se encontraron clientes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-down max-h-[90vh] overflow-y-auto">
                <div className="bg-primary-600 p-4 flex justify-between items-center text-white sticky top-0 z-10">
                    <h3 className="font-bold text-lg">Nuevo Cliente</h3>
                    <button type="button" onClick={handleModalClose} className="hover:bg-primary-700 p-1 rounded-full"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Datos Personales</h4>
                        <div className="flex items-center gap-4 mb-2">
                             <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                {newAvatar ? <img src={newAvatar} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Foto de Perfil</label>
                                 <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                            <input required value={newName} onChange={e => setNewName(e.target.value)} className={inputClass} placeholder="Nombre Apellido" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Nacimiento</label>
                                <input required type="date" value={newBirthDate} onChange={e => setNewBirthDate(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono (10 dígitos)</label>
                                <input required value={newPhone} onChange={e => setNewPhone(e.target.value)} className={inputClass} placeholder="5512345678" maxLength={10} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Seguridad</h4>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                                <div className="relative">
                                    <input required type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={`${inputClass} pr-10`} placeholder="Min 8 caracteres" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar</label>
                                <div className="relative">
                                    <input required type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`${inputClass} pr-10`} />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Médico y Contacto</h4>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Alergias</label>
                            <input value={newAllergies} onChange={e => setNewAllergies(e.target.value)} className={inputClass} placeholder="Ninguna" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Emergencia</label>
                                <input required value={newEmergName} onChange={e => setNewEmergName(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tel. Emergencia (10)</label>
                                <input required value={newEmergPhone} onChange={e => setNewEmergPhone(e.target.value)} className={inputClass} maxLength={10} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={handleModalClose} className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700">Registrar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
