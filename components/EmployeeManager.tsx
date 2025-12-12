
import React, { useState } from 'react';
import { Employee, Permission, WorkSchedule, BankingInfo, EmployeeStatus } from '../types';
import { Plus, Trash2, Shield, User, Lock, Mail, Image as ImageIcon, Check, Calendar, Phone, Briefcase, Clock, CalendarDays, ClipboardList, CreditCard, LogIn, Edit2, Copy, Smartphone, KeyRound, AlertTriangle, UserX, UserCheck } from 'lucide-react';
import { JOB_TITLES, MEXICAN_BANKS } from '../constants';

interface EmployeeManagerProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onSwitchUser: (emp: Employee) => void;
}

const PERMISSION_LIST: { id: Permission; label: string }[] = [
    { id: 'view_appointments', label: 'Ver Citas' },
    { id: 'edit_appointments', label: 'Crear/Editar Citas' },
    { id: 'view_patients', label: 'Ver Clientes' },
    { id: 'edit_patients', label: 'Editar Clientes' },
    { id: 'view_finance', label: 'Ver Finanzas (Dashboard)' },
    { id: 'manage_settings', label: 'Configuración Global' },
    { id: 'manage_employees', label: 'Gestionar Empleados' },
];

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee, onSwitchUser }) => {
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [tab, setTab] = useState<'info' | 'schedule' | 'permissions' | 'banking'>('info');
    const [viewMode, setViewMode] = useState<'grid' | 'history'>('grid');
    const [selectedEmployeeHistory, setSelectedEmployeeHistory] = useState<Employee | null>(null);

    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [hireDate, setHireDate] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Status State
    const [status, setStatus] = useState<EmployeeStatus>('active');
    const [statusChangeDate, setStatusChangeDate] = useState('');

    // Banking State
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [clabe, setClabe] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [isCustomBank, setIsCustomBank] = useState(false);
    
    // Schedule State
    const [schedule, setSchedule] = useState<WorkSchedule[]>([
        { dayOfWeek: 1, active: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 2, active: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 3, active: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 4, active: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 5, active: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 6, active: true, startTime: '10:00', endTime: '14:00' },
        { dayOfWeek: 0, active: false, startTime: '00:00', endTime: '00:00' },
    ]);

    const resetForm = () => {
        setEditId(null);
        setFullName('');
        setEmail('');
        setPhone('');
        setBirthDate('');
        setHireDate(new Date().toISOString().split('T')[0]);
        setJobTitle('');
        setRole('');
        setPassword('');
        setPermissions([]);
        setAvatarUrl(null);
        setIsAdmin(false);
        setBankName('');
        setAccountNumber('');
        setClabe('');
        setCardNumber('');
        setAccountHolder('');
        setIsCustomBank(false);
        setStatus('active');
        setStatusChangeDate('');
        setSchedule([
            { dayOfWeek: 1, active: true, startTime: '09:00', endTime: '18:00' },
            { dayOfWeek: 2, active: true, startTime: '09:00', endTime: '18:00' },
            { dayOfWeek: 3, active: true, startTime: '09:00', endTime: '18:00' },
            { dayOfWeek: 4, active: true, startTime: '09:00', endTime: '18:00' },
            { dayOfWeek: 5, active: true, startTime: '09:00', endTime: '18:00' },
            { dayOfWeek: 6, active: true, startTime: '10:00', endTime: '14:00' },
            { dayOfWeek: 0, active: false, startTime: '00:00', endTime: '00:00' },
        ]);
        setTab('info');
    };

    const handleEdit = (emp: Employee) => {
        setEditId(emp.id);
        setFullName(emp.fullName);
        setEmail(emp.email);
        setPhone(emp.phone || '');
        setBirthDate(emp.birthDate || '');
        setHireDate(emp.hireDate || '');
        setJobTitle(emp.jobTitle || '');
        setRole(emp.role);
        setPassword(emp.password || '');
        setPermissions(emp.permissions);
        setAvatarUrl(emp.avatarUrl);
        setIsAdmin(emp.permissions.includes('all'));
        setSchedule(emp.workSchedule || []);
        setStatus(emp.status || 'active');
        setStatusChangeDate(emp.statusChangeDate || '');

        // Banking
        const currentBank = emp.bankingInfo?.bankName || '';
        
        if (currentBank && !MEXICAN_BANKS.includes(currentBank)) {
            setIsCustomBank(true);
            setBankName(currentBank);
        } else {
            setIsCustomBank(false);
            setBankName(currentBank);
        }

        setAccountNumber(emp.bankingInfo?.accountNumber || '');
        setClabe(emp.bankingInfo?.clabe || '');
        setCardNumber(emp.bankingInfo?.cardNumber || '');
        setAccountHolder(emp.bankingInfo?.accountHolder || emp.fullName);

        setShowModal(true);
    };

    const cleanPhone = (p: string) => p.replace(/\D/g, '');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cleanPhone(phone).length !== 10) {
            alert("⚠️ NÚMERO INCOMPLETO\n\nEl teléfono del empleado debe tener exactamente 10 dígitos. Por favor corrígelo para continuar.");
            return;
        }

        if (status !== 'active' && !statusChangeDate) {
            alert("⚠️ FECHA REQUERIDA\n\nPara el estado de Baja o Suspensión, debes ingresar la fecha en que se aplicó el cambio.");
            return;
        }

        const finalPerms: Permission[] = isAdmin ? ['all'] : permissions;

        const bankingData: BankingInfo = {
            bankName,
            accountNumber,
            clabe,
            cardNumber,
            accountHolder: accountHolder || fullName
        };

        const empData: Employee = {
            id: editId || `e-${Date.now()}`,
            fullName,
            email,
            phone,
            birthDate,
            hireDate,
            jobTitle,
            role, // Role is now auto-set or manually edited
            password,
            permissions: finalPerms,
            avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${fullName}&background=random`,
            workSchedule: schedule,
            attendanceLog: editId ? employees.find(e => e.id === editId)?.attendanceLog || [] : [],
            bankingInfo: bankingData,
            status,
            statusChangeDate: status !== 'active' ? statusChangeDate : undefined
        };

        if (editId) {
            onUpdateEmployee(empData);
        } else {
            onAddEmployee(empData);
        }
        setShowModal(false);
        resetForm();
    };

    const togglePermission = (perm: Permission) => {
        if (permissions.includes(perm)) {
            setPermissions(permissions.filter(p => p !== perm));
        } else {
            setPermissions([...permissions, perm]);
        }
    };

    const handleScheduleUpdate = (index: number, field: keyof WorkSchedule, value: any) => {
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSchedule(newSchedule);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleBankSelection = (value: string) => {
        if (value === 'Otro') {
            setIsCustomBank(true);
            setBankName('');
        } else {
            setIsCustomBank(false);
            setBankName(value);
        }
    };

    const viewHistory = (emp: Employee) => {
        setSelectedEmployeeHistory(emp);
        setViewMode('history');
    };

    const copyCredentials = () => {
        const message = `👋 Hola ${fullName.split(' ')[0]}, bienvenido al equipo Maine SPA.\n\n🔐 Tus credenciales de acceso a la App son:\n\n📱 Usuario: ${phone}\n🔑 Contraseña: ${password}\n\nPor favor ingresa y cambia tu contraseña lo antes posible.`;
        navigator.clipboard.writeText(message);
        alert('Credenciales copiadas al portapapeles. ¡Listo para enviar por WhatsApp!');
    };

    const inputClass = "w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none";
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const getStatusBadge = (s: EmployeeStatus) => {
        switch(s) {
            case 'active': return <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1"><UserCheck size={10}/> ACTIVO</span>;
            case 'suspended': return <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1"><AlertTriangle size={10}/> SUSPENDIDO</span>;
            case 'terminated': return <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1"><UserX size={10}/> BAJA</span>;
            default: return null;
        }
    };

    if (viewMode === 'history' && selectedEmployeeHistory) {
        return (
            <div className="animate-fade-in space-y-6">
                <button onClick={() => setViewMode('grid')} className="text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-4 font-medium">
                    ← Volver al equipo
                </button>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                         <img src={selectedEmployeeHistory.avatarUrl} className="w-16 h-16 rounded-full" />
                         <div>
                             <h2 className="text-2xl font-bold text-slate-900">{selectedEmployeeHistory.fullName}</h2>
                             <p className="text-slate-500">{selectedEmployeeHistory.jobTitle}</p>
                             <div className="mt-2">{getStatusBadge(selectedEmployeeHistory.status)}</div>
                         </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ClipboardList size={20}/> Historial de Asistencia</h3>
                    {selectedEmployeeHistory.attendanceLog.length === 0 ? (
                        <p className="text-slate-400 italic">No hay registros de asistencia.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                                        <th className="p-3">Fecha</th>
                                        <th className="p-3">Entrada</th>
                                        <th className="p-3">Salida</th>
                                        <th className="p-3">Estatus</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedEmployeeHistory.attendanceLog.map((log, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-700">{log.date}</td>
                                            <td className="p-3 text-green-600 font-mono">{log.checkIn || '--:--'}</td>
                                            <td className="p-3 text-red-600 font-mono">{log.checkOut || '--:--'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${log.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {log.status === 'present' ? 'Presente' : 'Ausente'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Equipo y Recursos Humanos</h2>
                    <p className="text-slate-500">Gestiona empleados, horarios y permisos.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800 shadow-lg"
                >
                    <Plus size={18} /> Nuevo Empleado
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map(emp => (
                    <div key={emp.id} className={`bg-white rounded-2xl border ${emp.status !== 'active' ? 'border-red-100 bg-red-50/20' : 'border-slate-100'} p-6 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <img src={emp.avatarUrl} alt={emp.fullName} className={`w-14 h-14 rounded-full object-cover border-2 ${emp.status !== 'active' ? 'border-red-100 grayscale' : 'border-slate-50'}`} />
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight">{emp.fullName}</h3>
                                    <p className="text-xs text-slate-500 font-semibold uppercase">{emp.jobTitle}</p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Smartphone size={10}/> {emp.phone}</p>
                                </div>
                            </div>
                            {/* IMPERSONATE BUTTON - Only active users */}
                            {emp.status === 'active' && (
                                <button 
                                    onClick={() => {
                                        if(confirm(`¿Deseas iniciar sesión como ${emp.fullName}?`)) {
                                            onSwitchUser(emp);
                                        }
                                    }}
                                    className="flex items-center gap-1.5 text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors border border-primary-100"
                                    title="Entrar como este empleado"
                                >
                                    <LogIn size={16} /> <span className="text-xs font-bold">Acceder</span>
                                </button>
                            )}
                        </div>
                        
                        <div className="mb-4 flex-1">
                             <div className="flex flex-wrap gap-1 mb-2 items-center">
                                <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded font-medium border border-slate-200">
                                    {emp.role}
                                </span>
                                {getStatusBadge(emp.status)}
                             </div>
                            <div className="flex flex-wrap gap-1">
                                {emp.permissions.includes('all') ? (
                                    <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1">
                                        <Shield size={10} /> SUPER ADMIN
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-slate-400">
                                        {emp.permissions.length} permisos activos
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between gap-2 border-t border-slate-50 pt-3 mt-auto">
                            <button onClick={() => viewHistory(emp)} className="text-slate-500 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                                <Clock size={14} /> Asistencia
                            </button>
                            <div className="flex gap-1">
                                <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button onClick={() => { if(confirm('¿Eliminar empleado?')) onDeleteEmployee(emp.id); }} className="text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg text-sm font-medium">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-down max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="bg-slate-900 p-4 flex justify-between items-center text-white sticky top-0 z-10 shrink-0">
                            <h3 className="font-bold text-lg">{editId ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
                            <button onClick={() => setShowModal(false)} className="hover:bg-slate-700 p-1 rounded-full"><Plus size={24} className="rotate-45" /></button>
                        </div>

                        <div className="flex border-b border-slate-200 shrink-0 bg-white sticky top-16 z-10 overflow-x-auto">
                            <button onClick={() => setTab('info')} className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 ${tab === 'info' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}>Información</button>
                            <button onClick={() => setTab('schedule')} className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 ${tab === 'schedule' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}>Horario</button>
                            <button onClick={() => setTab('banking')} className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 ${tab === 'banking' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}>Datos Bancarios</button>
                            <button onClick={() => setTab('permissions')} className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 ${tab === 'permissions' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}>Accesos y Permisos</button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-6 flex-1 overflow-y-auto">
                            {tab === 'info' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                                        </div>
                                        <div>
                                            <label className="text-xs text-blue-600 font-bold cursor-pointer hover:underline block mb-1">
                                                Subir Foto
                                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                            </label>
                                            <p className="text-[10px] text-slate-400">Recomendado: 200x200px</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                                            <input required value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} placeholder="Nombre Apellido" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Puesto (Cargo)</label>
                                            <select 
                                                required 
                                                value={jobTitle} 
                                                onChange={e => {
                                                    const newTitle = e.target.value;
                                                    setJobTitle(newTitle);
                                                    setRole(newTitle); // Auto-sync role with job title
                                                }} 
                                                className={inputClass}
                                            >
                                                <option value="">Seleccionar Puesto</option>
                                                {JOB_TITLES.map(title => (
                                                    <option key={title} value={title}>{title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Status Management */}
                                        <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado del Empleado</label>
                                                <select value={status} onChange={e => setStatus(e.target.value as EmployeeStatus)} className={inputClass}>
                                                    <option value="active">🟢 Activo</option>
                                                    <option value="suspended">🟠 Suspendido</option>
                                                    <option value="terminated">🔴 Baja Definitiva</option>
                                                </select>
                                            </div>
                                            {status !== 'active' && (
                                                <div className="animate-fade-in">
                                                    <label className="block text-xs font-bold text-red-600 uppercase mb-1">
                                                        Fecha de {status === 'suspended' ? 'Suspensión' : 'Baja'}
                                                    </label>
                                                    <input 
                                                        required 
                                                        type="date" 
                                                        value={statusChangeDate} 
                                                        onChange={e => setStatusChangeDate(e.target.value)} 
                                                        className={inputClass} 
                                                        style={{ colorScheme: 'light', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }} 
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono Móvil (10 dígitos)</label>
                                            <input required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} maxLength={10} placeholder="5512345678" />
                                            <p className="text-[10px] text-slate-400 mt-1">*Este será su usuario de acceso.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Nacimiento</label>
                                            <input required type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Contratación</label>
                                            <input required type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'schedule' && (
                                <div className="space-y-4 animate-fade-in">
                                    <p className="text-sm text-slate-500 mb-4">Define los días y horas laborales de este empleado.</p>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        {schedule.map((day, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                                                <div className="flex items-center gap-3 w-24">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={day.active} 
                                                        onChange={(e) => handleScheduleUpdate(idx, 'active', e.target.checked)}
                                                        className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                                                    />
                                                    <span className={`font-bold text-sm ${day.active ? 'text-slate-900' : 'text-slate-400'}`}>{days[day.dayOfWeek]}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="time" 
                                                        value={day.startTime}
                                                        onChange={(e) => handleScheduleUpdate(idx, 'startTime', e.target.value)}
                                                        disabled={!day.active}
                                                        className="p-1 rounded border border-slate-300 text-sm w-24 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                                                    />
                                                    <span className="text-slate-400">-</span>
                                                    <input 
                                                        type="time" 
                                                        value={day.endTime}
                                                        onChange={(e) => handleScheduleUpdate(idx, 'endTime', e.target.value)}
                                                        disabled={!day.active}
                                                        className="p-1 rounded border border-slate-300 text-sm w-24 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {tab === 'banking' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                        <h4 className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-2"><Shield size={14}/> Validación de Cuenta</h4>
                                        <p className="text-xs text-blue-800">
                                            Asegúrate de que la cuenta bancaria esté a nombre del empleado para evitar rechazos en nómina.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Banco</label>
                                            <select 
                                                className={inputClass}
                                                value={isCustomBank ? 'Otro' : bankName}
                                                onChange={e => handleBankSelection(e.target.value)}
                                            >
                                                <option value="">Seleccionar Banco</option>
                                                {MEXICAN_BANKS.map(bank => (
                                                    <option key={bank} value={bank}>{bank}</option>
                                                ))}
                                                <option value="Otro">Otro...</option>
                                            </select>
                                        </div>
                                         <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No. Cuenta (10 dígitos)</label>
                                            <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className={inputClass} />
                                        </div>
                                         {isCustomBank && (
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Banco (Otro)</label>
                                                <input 
                                                    value={bankName}
                                                    onChange={e => setBankName(e.target.value)}
                                                    className={inputClass} 
                                                    placeholder="Escribe el nombre del banco"
                                                />
                                            </div>
                                        )}
                                         <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CLABE (18 dígitos)</label>
                                            <input value={clabe} onChange={e => setClabe(e.target.value)} className={inputClass} />
                                        </div>
                                         <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No. Tarjeta (Opcional)</label>
                                            <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} className={inputClass} />
                                        </div>
                                         <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titular de la Cuenta</label>
                                            <input 
                                                value={accountHolder} 
                                                onChange={e => setAccountHolder(e.target.value)} 
                                                className={inputClass} 
                                                placeholder={fullName}
                                            />
                                            {accountHolder && fullName && accountHolder.toLowerCase() !== fullName.toLowerCase() && (
                                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 font-medium">
                                                    ⚠ El titular difiere del nombre del empleado.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'permissions' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-6">
                                        <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                                            <KeyRound size={16} /> Credenciales de Acceso
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuario (Teléfono)</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <input 
                                                        value={phone} 
                                                        disabled 
                                                        className="w-full p-2.5 pl-10 bg-slate-200 border border-slate-300 rounded-lg text-slate-600 cursor-not-allowed font-mono" 
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asignar Contraseña</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <input 
                                                        required 
                                                        type="text" 
                                                        value={password} 
                                                        onChange={e => setPassword(e.target.value)} 
                                                        className="w-full p-2.5 pl-10 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none" 
                                                        placeholder="Crear contraseña"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex justify-end">
                                            <button 
                                                type="button" 
                                                onClick={copyCredentials}
                                                disabled={!phone || !password}
                                                className="text-xs font-bold text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <Copy size={12} /> Copiar accesos para enviar
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol (Etiqueta)</label>
                                        <input 
                                            required 
                                            value={role} 
                                            onChange={e => setRole(e.target.value)} 
                                            className={inputClass} 
                                            placeholder="Se llena automáticamente con el Puesto" 
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Este nombre aparecerá en la interfaz. Por defecto es igual al puesto.</p>
                                    </div>
                                    
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center gap-3 cursor-pointer mt-4" onClick={() => setIsAdmin(!isAdmin)}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAdmin ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-purple-300'}`}>
                                            {isAdmin && <Check size={14} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-purple-900 text-sm">Acceso Total (Administrador)</p>
                                            <p className="text-xs text-purple-700">Tiene control absoluto sobre todos los módulos.</p>
                                        </div>
                                    </div>

                                    {!isAdmin && (
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            {PERMISSION_LIST.map(perm => (
                                                <div 
                                                    key={perm.id} 
                                                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${permissions.includes(perm.id) ? 'bg-white border-primary-500 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                                                    onClick={() => togglePermission(perm.id)}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${permissions.includes(perm.id) ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-slate-300'}`}>
                                                        {permissions.includes(perm.id) && <Check size={12} />}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{perm.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 font-medium">Cancelar</button>
                                <button type="submit" className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg">Guardar Empleado</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManager;
