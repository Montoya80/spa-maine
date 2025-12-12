
import React, { ReactNode, useState } from 'react';
import { ViewState, UserRole, Employee } from '../types';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  UserCircle,
  Menu,
  X,
  User,
  Briefcase,
  ChevronDown,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  currentUser: Employee;
  allEmployees: Employee[];
  onSwitchUser: (emp: Employee) => void;
  onUpdatePassword?: (newPass: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onNavigate,
  userRole,
  onToggleRole,
  currentUser,
  allEmployees,
  onSwitchUser,
  onUpdatePassword
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Permission Checks
  const hasPermission = (perm: string) => currentUser.permissions.includes('all') || currentUser.permissions.includes(perm as any);

  // Navigation items for Admin
  const adminNavItems = [
    { id: ViewState.DASHBOARD, label: 'Inicio', icon: LayoutDashboard, show: true },
    { id: ViewState.APPOINTMENTS, label: 'Agenda de Citas', icon: Calendar, show: hasPermission('view_appointments') },
    { id: ViewState.PATIENTS, label: 'Clientes', icon: Users, show: hasPermission('view_patients') },
    { id: ViewState.EMPLOYEES, label: 'Equipo', icon: Briefcase, show: hasPermission('manage_employees') },
  ];

  // Navigation items for Client (Simplified)
  const clientNavItems = [
    { id: ViewState.CLIENT_BOOKING, label: 'Reservar Cita', icon: Calendar, show: true },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : clientNavItems;

  const handleNavClick = (view: ViewState) => {
    onNavigate(view);
    setIsMobileMenuOpen(false); 
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword !== confirmNewPassword) {
          alert("Las contraseñas no coinciden.");
          return;
      }
      if (newPassword.length < 4) {
           alert("La contraseña es muy corta.");
           return;
      }
      if (onUpdatePassword) {
          onUpdatePassword(newPassword);
          setShowPasswordModal(false);
          setShowUserMenu(false);
          setNewPassword('');
          setConfirmNewPassword('');
          alert("Contraseña actualizada correctamente.");
      }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Mobile Header - Fixed at top, visible only on small screens */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white border-b border-slate-200 z-40 px-4 py-3 flex justify-between items-center shadow-sm h-16">
         <div className="flex items-center gap-3">
            <Logo className="h-8" layout="icon" />
            <span className="font-bold text-slate-900 text-sm tracking-tight">Maine SPA</span>
         </div>
         <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar - Acts as Drawer on Mobile, Fixed Sidebar on Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header (Desktop) */}
        <div className="p-6 md:flex items-center justify-center hidden border-b border-slate-50 min-h-[5rem]">
          <Logo className="h-10" />
        </div>

        {/* User / Role Profile Section */}
        <div className="px-4 py-4 md:mt-2 relative z-20">
             {userRole === 'admin' ? (
                 <div className="relative">
                     <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 hover:bg-slate-100 transition-all active:scale-[0.98]"
                     >
                        <img src={currentUser.avatarUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{currentUser.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentUser.role}</p>
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                     </button>

                     {showUserMenu && (
                         <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-slide-down z-50 ring-1 ring-slate-900/5">
                             <div className="p-1 border-b border-slate-50">
                                 <button 
                                    onClick={() => { setShowPasswordModal(true); setShowUserMenu(false); }}
                                    className="w-full flex items-center gap-3 p-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-left transition-colors"
                                 >
                                     <KeyRound size={16} /> Cambiar Contraseña
                                 </button>
                             </div>
                             
                             <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cambiar Usuario</div>
                             <div className="max-h-48 overflow-y-auto">
                                 {allEmployees.map(emp => (
                                     <button 
                                        key={emp.id}
                                        onClick={() => { onSwitchUser(emp); setShowUserMenu(false); }}
                                        className={`w-full flex items-center gap-3 p-2 hover:bg-slate-50 text-left text-sm transition-colors ${currentUser.id === emp.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600'}`}
                                     >
                                         <img src={emp.avatarUrl} className="w-6 h-6 rounded-full" />
                                         <span className="truncate">{emp.fullName}</span>
                                     </button>
                                 ))}
                             </div>
                         </div>
                     )}
                 </div>
             ) : (
                <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shadow-sm">
                    <User size={18} className="mr-2" /> MODO CLIENTE
                </div>
             )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2">
          {navItems.filter(i => i.show).map((item) => {
            const isActive = currentView === item.id || (currentView === ViewState.PATIENT_DETAIL && item.id === ViewState.PATIENTS);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm ring-1 ring-primary-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          {/* Fix: Added onClick handler to Client Profile button */}
          {userRole === 'client' && currentView === ViewState.CLIENT_PORTAL && (
               <button
                onClick={() => handleNavClick(ViewState.CLIENT_PORTAL)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-primary-50 text-primary-700 font-semibold shadow-sm ring-1 ring-primary-100"
              >
                <User size={20} strokeWidth={2.5} />
                <span>Mi Perfil</span>
              </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2 bg-white">
          {userRole === 'admin' && hasPermission('manage_settings') && (
             <button 
                onClick={() => handleNavClick(ViewState.SETTINGS)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 w-full ${
                    currentView === ViewState.SETTINGS 
                    ? 'bg-primary-50 text-primary-700 font-semibold ring-1 ring-primary-100' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
             >
                <Settings size={20} />
                <span className="text-sm font-medium">Configuración</span>
             </button>
          )}
          
          <button 
            onClick={() => {
                onToggleRole();
                setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors w-full border border-red-100"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative bg-slate-50/50 pt-16 md:pt-0 w-full">
        <div className="max-w-7xl mx-auto p-4 md:p-8 h-full">
          {children}
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-down">
                   <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                       <h3 className="font-bold text-lg">Cambiar Contraseña</h3>
                       <button onClick={() => setShowPasswordModal(false)} className="hover:bg-slate-700 p-1 rounded-full"><X size={20} /></button>
                   </div>
                   <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                           <div className="relative">
                               <input 
                                   type={showPass ? "text" : "password"} 
                                   required 
                                   value={newPassword}
                                   onChange={e => setNewPassword(e.target.value)}
                                   className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-10"
                               />
                               <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                   {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                               </button>
                           </div>
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                           <input 
                               type={showPass ? "text" : "password"} 
                               required 
                               value={confirmNewPassword}
                               onChange={e => setConfirmNewPassword(e.target.value)}
                               className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                           />
                       </div>
                       <div className="flex justify-end gap-2 pt-2">
                           <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">Cancelar</button>
                           <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">Actualizar</button>
                       </div>
                   </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Layout;
