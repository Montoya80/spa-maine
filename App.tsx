
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import AppointmentManager from './components/AppointmentManager';
import ClientBooking from './components/ClientBooking';
import ClientPortal from './components/ClientPortal';
import AdminSettings from './components/AdminSettings';
import EmployeeManager from './components/EmployeeManager';
import Login from './components/Login';
import FrontPage from './components/FrontPage';
import { ViewState, Patient, Appointment, UserRole, Service, Promotion, BusinessConfig, Employee, AttendanceRecord, Product } from './types';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, INITIAL_SERVICES, INITIAL_PROMOS, INITIAL_CONFIG, MOCK_EMPLOYEES, INITIAL_PRODUCTS } from './constants';

type ActionIntent = 'new_patient' | 'new_appointment' | null;

const App: React.FC = () => {
  // Navigation State
  const [showLanding, setShowLanding] = useState(true);
  const [loginTab, setLoginTab] = useState<'client' | 'employee'>('client');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('client'); 
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Data State
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS); // NEW STATE
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(INITIAL_CONFIG);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [actionIntent, setActionIntent] = useState<ActionIntent>(null);

  // -- Navigation Handlers --

  const handleLandingLogin = (type: 'client' | 'employee') => {
      setLoginTab(type);
      setShowLanding(false);
  };

  const handleLandingBooking = () => {
      setLoginTab('client');
      setShowLanding(false);
  };

  const handleBackToLanding = () => {
      setShowLanding(true);
      setIsAuthenticated(false);
  };

  // -- Login Handler --
  const handleLoginSuccess = (user: Employee | Patient, role: 'admin' | 'client') => {
      if (role === 'admin') {
          setCurrentUser(user as Employee);
          setUserRole('admin');
          setCurrentView(ViewState.DASHBOARD);
      } else {
          setSelectedPatient(user as Patient);
          setUserRole('client');
          setCurrentView(ViewState.CLIENT_PORTAL);
          setCurrentUser(null); 
      }
      setIsAuthenticated(true);
      setShowLanding(false);
  };

  const handleGuestBooking = () => {
      setUserRole('client');
      setIsAuthenticated(true);
      setCurrentView(ViewState.CLIENT_BOOKING);
      setCurrentUser(null);
      setSelectedPatient(null);
      setShowLanding(false);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setSelectedPatient(null);
      setUserRole('client');
      setActionIntent(null);
      setShowLanding(true); 
  };

  // Permission Checker
  const hasPermission = (perm: string) => {
      if (userRole === 'client' || !currentUser) return false;
      return currentUser.permissions.includes('all') || currentUser.permissions.includes(perm as any);
  };

  const toggleRole = () => {
    handleLogout();
  };

  const handleNavigate = (view: ViewState) => {
    if (view === ViewState.SETTINGS && !hasPermission('manage_settings')) return;
    if (view === ViewState.EMPLOYEES && !hasPermission('manage_employees')) return;

    setCurrentView(view);
    if (view !== ViewState.PATIENT_DETAIL && view !== ViewState.CLIENT_PORTAL) {
      setSelectedPatient(null);
    }
    setActionIntent(null);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView(ViewState.PATIENT_DETAIL);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    if (!hasPermission('edit_patients')) return;
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setSelectedPatient(updatedPatient);
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };
  
  const handleDeletePatient = (id: string) => {
      if (!hasPermission('edit_patients')) {
          alert('No tienes permiso para eliminar clientes.');
          return;
      }
      if (confirm('¿Estás seguro de que deseas eliminar este cliente y todos sus datos? Esta acción no se puede deshacer.')) {
          setPatients(prev => prev.filter(p => p.id !== id));
          setAppointments(prev => prev.filter(a => a.patientId !== id)); 
          setSelectedPatient(null);
          setCurrentView(ViewState.PATIENTS);
      }
  };

  const handleAddAppointment = (newAppointment: Appointment) => {
    if (!hasPermission('edit_appointments')) {
        alert('No tienes permiso para crear citas.');
        return;
    }
    setAppointments(prev => [newAppointment, ...prev]);
  };

  const handleUpdateAppointment = (updatedApt: Appointment) => {
      setAppointments(prev => prev.map(a => a.id === updatedApt.id ? updatedApt : a));
  };

  const handleClientBooking = (newAppointment: Appointment, newPatient: Patient) => {
    const existingPatient = patients.find(p => p.email.toLowerCase() === newPatient.email.toLowerCase());
    if (existingPatient) {
        newAppointment.patientId = existingPatient.id;
        newAppointment.patientName = existingPatient.fullName;
    } else {
        setPatients(prev => [newPatient, ...prev]);
    }
    setAppointments(prev => [newAppointment, ...prev]);
  };

  const handleClientLoginFromBooking = (patient: Patient) => {
      setSelectedPatient(patient);
      setCurrentView(ViewState.CLIENT_PORTAL);
  };

  const handleClientCancelAppointment = (aptId: string) => {
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'cancelled' } : a));
  };

  const handleBackToPortal = () => {
      if (selectedPatient && userRole === 'client') {
          setCurrentView(ViewState.CLIENT_PORTAL);
      }
  };

  const goToNewAppointment = () => {
    if (!hasPermission('edit_appointments')) return;
    setActionIntent('new_appointment');
    setCurrentView(ViewState.APPOINTMENTS);
  };

  const goToNewPatient = () => {
    if (!hasPermission('edit_patients')) return;
    setActionIntent('new_patient');
    setCurrentView(ViewState.PATIENTS);
  };

  const handleAddEmployee = (emp: Employee) => setEmployees(prev => [...prev, emp]);
  
  const handleUpdateEmployee = (emp: Employee) => {
      setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
      if (currentUser && currentUser.id === emp.id) {
          setCurrentUser(emp);
      }
  };
  
  const handleDeleteEmployee = (id: string) => setEmployees(prev => prev.filter(e => e.id !== id));

  const handleQuickSwitchUser = (emp: Employee) => {
      setCurrentUser(emp);
      setCurrentView(ViewState.DASHBOARD);
  };

  const handleUpdateUserPassword = (newPass: string) => {
      if (!currentUser) return;
      const updatedUser = { ...currentUser, password: newPass };
      handleUpdateEmployee(updatedUser);
  };

  const handleClockIn = (empId: string) => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setEmployees(prevEmployees => {
          const updatedEmployees = prevEmployees.map(emp => {
            if (emp.id === empId) {
                const newLog: AttendanceRecord = {
                    date: dateStr,
                    checkIn: timeStr,
                    status: 'present'
                };
                return { ...emp, attendanceLog: [...emp.attendanceLog, newLog] };
            }
            return emp;
          });
          
          if (currentUser && currentUser.id === empId) {
             const updatedUser = updatedEmployees.find(e => e.id === empId);
             if (updatedUser) setCurrentUser(updatedUser);
          }
          return updatedEmployees;
      });
  };

  const handleClockOut = (empId: string) => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setEmployees(prevEmployees => {
          const updatedEmployees = prevEmployees.map(emp => {
            if (emp.id === empId) {
                const updatedLog = emp.attendanceLog.map(l => {
                    if (l.date === dateStr && !l.checkOut) {
                        return { ...l, checkOut: timeStr };
                    }
                    return l;
                });
                return { ...emp, attendanceLog: updatedLog };
            }
            return emp;
          });

          if (currentUser && currentUser.id === empId) {
             const updatedUser = updatedEmployees.find(e => e.id === empId);
             if (updatedUser) setCurrentUser(updatedUser);
          }
          return updatedEmployees;
      });
  };

  const renderContent = () => {
    if (userRole === 'client') {
        if (currentView === ViewState.CLIENT_PORTAL && selectedPatient) {
            return (
                <ClientPortal 
                    patient={selectedPatient}
                    appointments={appointments}
                    businessConfig={businessConfig}
                    onLogout={handleLogout}
                    onNewAppointment={() => setCurrentView(ViewState.CLIENT_BOOKING)}
                    onCancelAppointment={handleClientCancelAppointment}
                />
            );
        }
        return (
            <ClientBooking 
                existingAppointments={appointments}
                allPatients={patients}
                services={services}
                promotions={promotions}
                products={products} // PASS PRODUCTS
                businessConfig={businessConfig}
                onBookAppointment={handleClientBooking}
                onClientLogin={handleClientLoginFromBooking}
                currentUser={selectedPatient}
                onBack={selectedPatient ? handleBackToPortal : undefined}
            />
        );
    }

    if (!currentUser) return null;

    switch (currentView) {
      case ViewState.DASHBOARD:
        return (
          <Dashboard 
            appointments={appointments} 
            employees={employees}
            patients={patients} // Pass Patients for stats
            products={products} // Pass Products for alerts
            currentUser={currentUser}
            businessConfig={businessConfig}
            onNewAppointment={goToNewAppointment}
            onNewPatient={goToNewPatient}
            showFinance={hasPermission('view_finance')}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
          />
        );
      case ViewState.APPOINTMENTS:
        return (
          <AppointmentManager 
            appointments={appointments} 
            patients={patients}
            employees={employees}
            services={services}
            promotions={promotions} // PASS PROMOS
            products={products} // PASS PRODUCTS
            businessConfig={businessConfig}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            startOpen={actionIntent === 'new_appointment'}
            onOpenChange={(isOpen) => !isOpen && setActionIntent(null)}
            onRequestNewPatient={goToNewPatient}
            canEdit={hasPermission('edit_appointments')}
            currentUser={currentUser}
          />
        );
      case ViewState.PATIENTS:
        return (
          <PatientList 
            patients={patients} 
            onSelectPatient={handleSelectPatient} 
            onAddPatient={handleAddPatient}
            onDeletePatient={handleDeletePatient}
            startOpen={actionIntent === 'new_patient'}
            onOpenChange={(isOpen) => !isOpen && setActionIntent(null)}
            currentUser={currentUser}
            canDelete={hasPermission('edit_patients')}
          />
        );
      case ViewState.PATIENT_DETAIL:
        if (!selectedPatient) return <PatientList patients={patients} onSelectPatient={handleSelectPatient} onAddPatient={handleAddPatient} onDeletePatient={handleDeletePatient} currentUser={currentUser} canDelete={hasPermission('edit_patients')} />;
        return (
          <PatientDetail 
            patient={selectedPatient} 
            employees={employees}
            products={products}
            onBack={() => handleNavigate(ViewState.PATIENTS)}
            onUpdatePatient={handleUpdatePatient}
            onDeletePatient={handleDeletePatient}
          />
        );
      case ViewState.EMPLOYEES:
          return (
              <EmployeeManager 
                employees={employees}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onSwitchUser={handleQuickSwitchUser}
              />
          );
      case ViewState.SETTINGS:
        return (
          <AdminSettings 
             services={services}
             promotions={promotions}
             products={products} // PASS PRODUCTS
             businessConfig={businessConfig}
             patients={patients}
             appointments={appointments}
             employees={employees}
             onUpdateServices={setServices}
             onUpdatePromotions={setPromotions}
             onUpdateProducts={setProducts} // PASS UPDATE HANDLER
             onUpdateConfig={setBusinessConfig}
          />
        );
      default:
        return null;
    }
  };

  if (showLanding && !isAuthenticated) {
      return (
          <FrontPage 
              services={services}
              promotions={promotions}
              businessConfig={businessConfig}
              onNavigateLogin={handleLandingLogin}
              onNavigateBooking={handleLandingBooking}
          />
      );
  }

  if (!isAuthenticated) {
      return (
          <Login 
            employees={employees}
            patients={patients}
            onLoginSuccess={handleLoginSuccess}
            onGuestBooking={handleGuestBooking}
            initialTab={loginTab}
            onBackToHome={handleBackToLanding}
          />
      );
  }

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={handleNavigate}
      userRole={userRole}
      onToggleRole={toggleRole}
      currentUser={currentUser || MOCK_EMPLOYEES[0]}
      allEmployees={employees}
      onSwitchUser={setCurrentUser}
      onUpdatePassword={handleUpdateUserPassword}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
