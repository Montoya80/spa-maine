
import React, { useState, useEffect } from 'react';
import { Employee, Patient } from '../types';
import { User, Lock, ArrowRight, Smartphone, Eye, EyeOff, Calendar, ShieldCheck, KeyRound, X, Mail, MessageCircle, AlertCircle, ArrowLeft, UserPlus } from 'lucide-react';
import { getPasswordRecoveryMessage, generateWhatsAppLink, generateMailtoLink } from '../services/notificationService';
import Logo from './Logo';

interface LoginProps {
  employees: Employee[];
  patients: Patient[];
  onLoginSuccess: (user: Employee | Patient, role: 'admin' | 'client') => void;
  onGuestBooking: () => void;
  initialTab?: 'client' | 'employee'; 
  onBackToHome?: () => void; 
}

const Login: React.FC<LoginProps> = ({ employees, patients, onLoginSuccess, onGuestBooking, initialTab = 'client', onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'employee' | 'client'>(initialTab);
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
      setActiveTab(initialTab);
  }, [initialTab]);

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [recoveryMsg, setRecoveryMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'employee') {
        const cleanInputPhone = identifier.replace(/\D/g, ''); 
        const foundEmpByPhone = employees.find(emp => emp.phone.replace(/\D/g, '') === cleanInputPhone);

        if (foundEmpByPhone) {
            if (foundEmpByPhone.password === password.trim()) {
                onLoginSuccess(foundEmpByPhone, 'admin');
            } else {
                setError('Contraseña incorrecta.');
            }
        } else {
            setError('No existe ningún colaborador registrado con este teléfono.');
        }
    } else {
        const query = identifier.toLowerCase().trim();
        const cleanQueryPhone = query.replace(/\D/g, '');

        const foundPatient = patients.find(p => 
            p.email.toLowerCase() === query || 
            (cleanQueryPhone.length >= 7 && p.phone.replace(/\D/g, '') === cleanQueryPhone) || 
            p.clientCode.toLowerCase() === query
        );

        if (foundPatient) {
            if (foundPatient.password === password.trim()) {
                onLoginSuccess(foundPatient, 'client');
            } else {
                setError('Contraseña incorrecta.');
            }
        } else {
            setError('Datos incorrectos. No encontramos tu registro.');
        }
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setRecoveryStatus('idle');
      const query = recoveryInput.toLowerCase().trim();
      const cleanQueryPhone = query.replace(/\D/g, '');
      
      if (!query) return;

      let foundUser: Employee | Patient | undefined = employees.find(e => 
          e.phone.replace(/\D/g, '') === cleanQueryPhone || e.email.toLowerCase() === query
      );

      if (!foundUser) {
          foundUser = patients.find(p => 
            p.email.toLowerCase() === query || 
            p.phone.replace(/\D/g, '') === cleanQueryPhone || 
            p.clientCode.toLowerCase() === query
          );
      }

      if (!foundUser) {
          setRecoveryStatus('error');
          setRecoveryMsg('No encontramos ningún usuario (cliente o colaborador) con esos datos.');
          return;
      }

      const isPhoneInput = /^\d+$/.test(cleanQueryPhone) && cleanQueryPhone.length >= 7; 
      const messages = getPasswordRecoveryMessage(foundUser);

      if (isPhoneInput) {
          window.open(generateWhatsAppLink(foundUser.phone, messages.whatsapp), '_blank');
          setRecoveryMsg(`Se ha abierto WhatsApp para recuperar la contraseña del número: ${foundUser.phone}`);
      } else {
          window.open(generateMailtoLink(foundUser.email, messages.emailSubject, messages.emailBody), '_blank');
          setRecoveryMsg(`Se ha abierto tu gestor de correo para enviar la contraseña a: ${foundUser.email}`);
      }
      setRecoveryStatus('success');
  };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all bg-white text-slate-800 placeholder:text-slate-400 shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-rose-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

        {onBackToHome && (
            <button 
                onClick={onBackToHome}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-500 hover:text-teal-700 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full transition-colors font-medium shadow-sm hover:bg-white"
            >
                <ArrowLeft size={18} /> Volver al Inicio
            </button>
        )}

        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 w-full max-w-5xl flex overflow-hidden z-10 min-h-[600px] animate-slide-down">
            <div className="hidden lg:flex w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden group">
                 <div className="absolute inset-0 z-0">
                     <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" alt="Spa Relax"/>
                     <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 to-teal-800/40"></div>
                 </div>
                 
                 <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-8">
                        <Logo variant="white" className="h-16" />
                     </div>
                     <h1 className="text-4xl font-bold leading-tight mb-6 tracking-tight">
                        Tu refugio de <br/> <span className="text-teal-200">paz y belleza.</span>
                     </h1>
                     <p className="text-teal-50 text-lg leading-relaxed max-w-sm">
                        Gestiona tus citas y descubre el equilibrio perfecto entre cuerpo y mente desde nuestra plataforma exclusiva.
                     </p>
                 </div>
                 <div className="relative z-10 text-xs text-teal-100/60 font-medium tracking-wide">
                     © {new Date().getFullYear()} MAINE SPA CENTER • BIENESTAR INTEGRAL
                 </div>
            </div>

            <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white/50 relative">
                <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido</h2>
                    <p className="text-slate-500">Ingresa tus credenciales para acceder al sistema.</p>
                </div>

                <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8 relative">
                    <button onClick={() => { setActiveTab('client'); setError(''); setIdentifier(''); setPassword(''); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'client' ? 'bg-white text-primary-700 shadow-md shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                        <User size={18} /> Soy Cliente
                    </button>
                    <button onClick={() => { setActiveTab('employee'); setError(''); setIdentifier(''); setPassword(''); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'employee' ? 'bg-white text-primary-700 shadow-md shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                        <ShieldCheck size={18} /> Colaborador
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1 tracking-wider">
                            {activeTab === 'employee' ? 'Teléfono Móvil' : 'Email, Teléfono o Código'}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300 group-focus-within:text-primary-500 transition-colors">
                                {activeTab === 'employee' ? <Smartphone size={20} /> : <User size={20} />}
                            </div>
                            <input type={activeTab === 'employee' ? 'tel' : 'text'} required autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value.trim())} className={inputClass} placeholder={activeTab === 'employee' ? '10 dígitos' : 'Ingresa tus datos'} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1 tracking-wider">Contraseña</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300 group-focus-within:text-primary-500 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-500 transition-colors">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="flex justify-end mt-2">
                            <button type="button" onClick={() => { setShowRecoveryModal(true); setRecoveryStatus('idle'); setRecoveryInput(''); }} className="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline">
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 text-sm p-4 rounded-xl border border-rose-100 flex items-center gap-2 animate-fade-in">
                            <ShieldCheck size={18} className="shrink-0" /> <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 rounded-xl font-bold text-lg hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group">
                        Ingresar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                {activeTab === 'client' && (
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-400 text-sm mb-4">¿Aún no tienes cuenta?</p>
                        <button 
                            onClick={onGuestBooking}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-slate-200"
                        >
                            <UserPlus size={18} /> Soy Nuevo: Registrarme y Agendar
                        </button>
                    </div>
                )}
            </div>
        </div>

        {showRecoveryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-down">
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                        <h3 className="font-bold text-lg flex items-center gap-2"><KeyRound size={20}/> Recuperar Acceso</h3>
                        <button onClick={() => setShowRecoveryModal(false)} className="hover:bg-slate-700 p-1 rounded-full"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleRecoverySubmit} className="p-6 space-y-4">
                        <p className="text-sm text-slate-600 leading-relaxed">Ingresa tu <strong>Teléfono, Correo o Código</strong>. El sistema te enviará tu contraseña.</p>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
                            <div className="flex items-center gap-2"><Smartphone size={14} className="text-green-600"/> Si ingresas Teléfono → Se envía por <strong>WhatsApp</strong>.</div>
                            <div className="flex items-center gap-2"><Mail size={14} className="text-blue-600"/> Si ingresas Correo/Código → Se envía por <strong>Email</strong>.</div>
                        </div>
                        <div>
                            <input required value={recoveryInput} onChange={e => setRecoveryInput(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej: 5512345678 o nombre@correo.com"/>
                        </div>
                        {recoveryStatus === 'error' && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2"><AlertCircle size={16} /> {recoveryMsg}</div>}
                        {recoveryStatus === 'success' && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-100 flex items-start gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0" /> <span>{recoveryMsg}</span></div>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowRecoveryModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium">Cerrar</button>
                            <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Recuperar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Login;
