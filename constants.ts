
import { Patient, Appointment, Service, Promotion, BusinessConfig, Employee, WorkSchedule, Product } from './types';

// Helper to ensure dates are always valid for "Today" in the demo
// This ensures the Dashboard always shows activity when you open the app
const getToday = () => {
    const d = new Date();
    // Format YYYY-MM-DD based on local time to avoid timezone issues affecting "Today" view
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
};

const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

export const JOB_TITLES = [
    "Gerente General",
    "Recepcionista",
    "Cosmetóloga",
    "Dermatólogo/a",
    "Terapeuta de Spa",
    "Estilista",
    "Auxiliar de Limpieza",
    "Marketing"
];

export const MEXICAN_BANKS = [
    "BBVA",
    "Santander",
    "Banamex",
    "Banorte",
    "HSBC",
    "Scotiabank",
    "Inbursa",
    "Banco Azteca",
    "Banregio",
    "Afirme",
    "BanBajío",
    "Bancoppel",
    "Liverpool",
    "Spin by OXXO",
    "Mercado Pago",
    "Nu Mexico",
    "STP"
];

const DEFAULT_SCHEDULE: WorkSchedule[] = [
    { dayOfWeek: 1, active: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 2, active: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 3, active: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 4, active: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 5, active: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 6, active: true, startTime: '10:00', endTime: '14:00' },
    { dayOfWeek: 0, active: false, startTime: '00:00', endTime: '00:00' },
];

export const MOCK_EMPLOYEES: Employee[] = [
    {
        id: 'e1',
        fullName: 'Administrador General',
        email: 'admin@mainespa.com',
        phone: '5532229490',
        password: '123qweASD',
        birthDate: '1985-01-01',
        hireDate: '2020-01-01',
        jobTitle: 'Gerente General',
        role: 'Gerente',
        permissions: ['all'],
        avatarUrl: 'https://ui-avatars.com/api/?name=Admin+General&background=0D9488&color=fff',
        workSchedule: DEFAULT_SCHEDULE,
        attendanceLog: [],
        bankingInfo: { bankName: '', accountNumber: '', clabe: '', cardNumber: '', accountHolder: '' },
        status: 'active'
    },
    {
        id: 'e2',
        fullName: 'Lucía Recepcionista',
        email: 'lucia@mainespa.com',
        phone: '5555550002',
        password: 'user123',
        birthDate: '1995-03-15',
        hireDate: '2022-05-10',
        jobTitle: 'Recepcionista',
        role: 'Recepción',
        permissions: ['view_appointments', 'edit_appointments', 'view_patients'],
        avatarUrl: 'https://ui-avatars.com/api/?name=Lucia+R&background=random',
        workSchedule: DEFAULT_SCHEDULE,
        attendanceLog: [
            { date: getToday(), checkIn: '08:55', status: 'present' }
        ],
        bankingInfo: { bankName: 'BBVA', accountNumber: '1234567890', clabe: '012345678901234567', cardNumber: '4152313231323132', accountHolder: 'Lucía Recepcionista' },
        status: 'active'
    },
    {
        id: 'e3',
        fullName: 'Dra. Ana Estética',
        email: 'ana@mainespa.com',
        phone: '5555550003',
        password: 'user123',
        birthDate: '1988-07-20',
        hireDate: '2021-02-15',
        jobTitle: 'Dermatólogo/a',
        role: 'Especialista',
        permissions: ['view_appointments', 'view_patients', 'edit_patients'], 
        avatarUrl: 'https://ui-avatars.com/api/?name=Ana+E&background=random',
        workSchedule: DEFAULT_SCHEDULE,
        attendanceLog: [],
        bankingInfo: { bankName: '', accountNumber: '', clabe: '', cardNumber: '', accountHolder: '' },
        status: 'active'
    }
];

export const INITIAL_CONFIG: BusinessConfig = {
  schedule: [
    { dayOfWeek: 1, label: 'Lunes', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 2, label: 'Martes', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 3, label: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 4, label: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 5, label: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 6, label: 'Sábado', isOpen: true, openTime: '10:00', closeTime: '14:00' },
    { dayOfWeek: 0, label: 'Domingo', isOpen: false, openTime: '00:00', closeTime: '00:00' },
  ],
  blockedDates: [],
  blockedSlots: [],
  contact: {
    address: "Calle Ardilla #93, Colonia Benito Juarez, Cd Nezahualcoyotl",
    phone: "555-0000",
    whatsapp: "5615582029",
    email: "contacto@mainespa.com",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.559867946896!2d-99.0305886241289!3d19.38883734209592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1e2e1a3b8b6f1%3A0x6b8b8b8b8b8b8b8b!2sC.%20Ardilla%2093%2C%20Benito%20Ju%C3%A1rez%2C%2057000%20Nezahualc%C3%B3yotl%2C%20M%C3%A9x.!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx",
    facebookUrl: "https://facebook.com",
    instagramUrl: "https://instagram.com",
    tiktokUrl: ""
  },
  emailConfig: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: 'tu-correo@gmail.com',
      smtpPass: '',
      senderEmail: 'citas@mainespa.com',
      senderName: 'Maine SPA Center',
      enabled: false
  },
  bankingInfo: {
      bankName: 'Banorte',
      accountNumber: '0000000000',
      clabe: '072000000000000000',
      cardNumber: '',
      accountHolder: 'Maine SPA Center SA de CV'
  }
};

export const INITIAL_SERVICES: Service[] = [
  { 
      id: 's1', 
      name: "Limpieza Facial Profunda", 
      price: 850, 
      duration: 60, 
      active: true,
      description: "Elimina impurezas y células muertas para revelar una piel radiante. Incluye vapor, extracción y mascarilla hidratante.",
      imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
  },
  { 
      id: 's2', 
      name: "Masaje Relajante", 
      price: 1200, 
      duration: 60, 
      active: true,
      description: "Técnica sueca para liberar tensión muscular y estrés. Ideal para desconectar cuerpo y mente.",
      imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
  },
  { 
      id: 's3', 
      name: "Radiofrecuencia Facial", 
      price: 1500, 
      duration: 45, 
      active: true,
      description: "Lifting sin cirugía. Estimula el colágeno natural para reafirmar la piel y reducir líneas de expresión.",
      imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
  },
  { 
      id: 's4', 
      name: "Hidratación Profunda", 
      price: 950, 
      duration: 50, 
      active: true,
      description: "Tratamiento intensivo con ácido hialurónico y vitaminas para pieles secas o deshidratadas.",
      imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80"
  },
  { 
      id: 's5', 
      name: "Microdermoabrasión", 
      price: 1100, 
      duration: 45, 
      active: true,
      description: "Exfoliación mecánica con punta de diamante para suavizar la textura de la piel y atenuar manchas.",
      imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
  },
  { 
      id: 's6', 
      name: "Terapia LED", 
      price: 600, 
      duration: 30, 
      active: true,
      description: "Luz terapéutica para tratar acné, rejuvenecer y calmar la piel sensible.",
      imageUrl: "https://images.unsplash.com/photo-1610450919253-29f9c08a4746?auto=format&fit=crop&w=800&q=80"
  }
];

export const INITIAL_PRODUCTS: Product[] = [
    // Retail Products
    {
        id: 'prod1',
        name: 'Serum de Ácido Hialurónico',
        price: 850,
        stock: 3, 
        active: true,
        description: 'Hidratación profunda y efecto rellenador. Ideal para rutina de noche.',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
        category: 'Facial',
        categoryType: 'retail'
    },
    {
        id: 'prod2',
        name: 'Protector Solar FPS 50+',
        price: 650,
        stock: 30,
        active: true,
        description: 'Toque seco, sin efecto mimo. Protección de amplio espectro.',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-1915998df9a1?auto=format&fit=crop&w=500&q=80',
        category: 'Protección',
        categoryType: 'retail'
    },
    {
        id: 'prod3',
        name: 'Kit Rutina Completa',
        price: 2500,
        stock: 5, 
        active: true,
        description: 'Limpiador, Tónico, Serum y Crema. Todo lo que necesitas.',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=500&q=80',
        category: 'Kits',
        categoryType: 'retail'
    },
    // Professional Products (Insumos)
    {
        id: 'insumo1',
        name: 'Aceite de Masaje Neutro (Galón)',
        price: 0, 
        stock: 2, 
        active: true,
        description: 'Aceite base para masajes relajantes y descontracturantes.',
        category: 'Cabina',
        categoryType: 'professional',
        imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 'insumo2',
        name: 'Mascarilla Plástica Alginato',
        price: 0,
        stock: 20,
        active: true,
        description: 'Polvo para mascarilla hidroplástica.',
        category: 'Facial Pro',
        categoryType: 'professional',
        imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 'insumo3',
        name: 'Guantes de Nitrilo (Caja)',
        price: 0,
        stock: 10,
        active: true,
        description: 'Caja con 100 guantes talla M.',
        category: 'Desechables',
        categoryType: 'professional',
        imageUrl: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=500&q=80'
    }
];

export const INITIAL_PROMOS: Promotion[] = [
  { 
    id: 'promo1', 
    title: "Verano Radiante", 
    description: "Obtén un glow natural con nuestra hidratación profunda.", 
    discountText: "15% OFF", 
    validUntil: '2024-08-31',
    active: true,
    color: "bg-orange-500",
    price: 800
  },
  { 
    id: 'promo2', 
    title: "Pack Relax", 
    description: "Masaje + Limpieza Facial para desconectar totalmente.", 
    discountText: "$200 OFF", 
    validUntil: '2024-12-31',
    active: true,
    color: "bg-indigo-500",
    price: 1850
  }
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    clientCode: 'SR12345',
    fileNumber: '0100',
    fullName: 'Sofia Rodriguez',
    password: 'Password1',
    birthDate: '1995-05-15',
    email: 'sofia.rod@example.com',
    phone: '5550101000',
    skinType: 'Mixta',
    allergies: 'Ninguna',
    emergencyContact: { name: 'Juan Perez', phone: '5559999000' },
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    history: [
      {
        id: 'n1',
        date: '2023-10-15',
        treatment: 'Limpieza Facial Profunda',
        observations: 'Piel con leve congestión en zona T. Buena respuesta a la extracción.',
        productsUsed: ['Gel Limpiador', 'Tónico Calmante']
      }
    ],
    progressPhotos: [],
    clinicRecommendations: 'Utilizar protector solar cada 4 horas. Evitar exfoliantes agresivos.',
    registeredBy: 'Administrador General',
    registrationDate: '2023-10-01',
    assignedTherapist: 'Dra. Ana Estética'
  },
  {
    id: 'p2',
    clientCode: 'EG67890',
    fileNumber: '0101',
    fullName: 'Elena Garcia',
    password: 'Password1',
    birthDate: '1981-08-20',
    email: 'elena.g@example.com',
    phone: '5550202000',
    skinType: 'Seca / Sensible',
    allergies: 'Látex',
    emergencyContact: { name: 'Pedro Garcia', phone: '5558888000' },
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    history: [],
    progressPhotos: [],
    clinicRecommendations: '',
    registeredBy: 'Lucía Recepcionista',
    registrationDate: getToday(), // NEW CLIENT TODAY
    assignedTherapist: 'Dra. Ana Estética'
  },
  {
    id: 'p3',
    clientCode: 'CM54321',
    fileNumber: '0102',
    fullName: 'Carlos Mendoza',
    password: 'Password1',
    birthDate: '1988-12-10',
    email: 'carlos.m@example.com',
    phone: '5550303000',
    skinType: 'Grasa',
    allergies: 'Ninguna',
    emergencyContact: { name: 'Maria Mendoza', phone: '5557777000' },
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    history: [],
    progressPhotos: [],
    clinicRecommendations: '',
    registeredBy: 'Administrador General',
    registrationDate: '2024-01-20',
    assignedTherapist: 'Dra. Ana Estética'
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    patientName: 'Sofia Rodriguez',
    date: getToday(), // APPOINTMENT TODAY
    time: '10:00',
    service: 'Radiofrecuencia Facial',
    price: 1500,
    status: 'confirmed',
    assignedTo: 'e3',
    paymentVerified: true
  },
  {
    id: 'a2',
    patientId: 'p2',
    patientName: 'Elena Garcia',
    date: getToday(), // APPOINTMENT TODAY
    time: '14:00', 
    service: 'Hidratación Profunda',
    price: 950,
    status: 'pending',
    assignedTo: 'e3',
    paymentVerified: false
  },
  {
    id: 'a3',
    patientId: 'p3',
    patientName: 'Carlos Mendoza',
    date: getTomorrow(),
    time: '11:00',
    service: 'Microdermoabrasión',
    price: 1100,
    status: 'confirmed',
    assignedTo: 'e1',
    paymentVerified: true
  },
  // VENTA PENDIENTE PARA ALERTAS
  {
    id: 'a4',
    patientId: 'p3',
    patientName: 'Carlos Mendoza',
    date: getToday(),
    time: '12:30',
    service: 'Kit Rutina Completa', 
    price: 2500,
    status: 'pending',
    paymentVerified: false
  }
];
