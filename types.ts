
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  APPOINTMENTS = 'APPOINTMENTS',
  PATIENTS = 'PATIENTS',
  PATIENT_DETAIL = 'PATIENT_DETAIL',
  SETTINGS = 'SETTINGS', 
  EMPLOYEES = 'EMPLOYEES',
  CLIENT_BOOKING = 'CLIENT_BOOKING',
  CLIENT_PORTAL = 'CLIENT_PORTAL'
}

export type UserRole = 'admin' | 'client';

export type Permission = 
  | 'all' // Super Admin
  | 'view_appointments' 
  | 'edit_appointments' 
  | 'view_patients' 
  | 'edit_patients' 
  | 'view_finance' 
  | 'manage_settings'
  | 'manage_employees';

export interface WorkSchedule {
    dayOfWeek: number; // 0-6
    active: boolean;
    startTime: string;
    endTime: string;
}

export interface AttendanceRecord {
    date: string; // YYYY-MM-DD
    checkIn?: string; // HH:mm
    checkOut?: string; // HH:mm
    status: 'present' | 'absent' | 'late';
}

export interface BankingInfo {
    bankName: string;
    accountNumber: string;
    clabe: string;
    cardNumber: string;
    accountHolder: string;
}

export type EmployeeStatus = 'active' | 'suspended' | 'terminated';

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string; 
  birthDate: string; 
  hireDate: string; 
  jobTitle: string; 
  password?: string;
  role: string; // Label like "Receptionist"
  permissions: Permission[];
  avatarUrl: string;
  workSchedule: WorkSchedule[]; 
  attendanceLog: AttendanceRecord[]; 
  bankingInfo?: BankingInfo;
  status: EmployeeStatus; 
  statusChangeDate?: string; 
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  active: boolean;
  description?: string; 
  imageUrl?: string; 
}

export type ProductCategoryType = 'retail' | 'professional';

export interface Product {
  id: string;
  name: string;
  price: number; // Sale price for retail, Cost for professional
  stock: number;
  active: boolean;
  description?: string;
  imageUrl?: string;
  category?: string;
  categoryType: ProductCategoryType; // REQUIRED: Distinguishes Sale vs Internal Use
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountText: string; 
  validUntil?: string; 
  active: boolean;
  color: string; 
  price?: number; // Optional override price
}

export interface DaySchedule {
  dayOfWeek: number; 
  label: string;
  isOpen: boolean;
  openTime: string; 
  closeTime: string; 
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string; 
  senderEmail: string;
  senderName: string;
  enabled: boolean;
}

export interface BusinessConfig {
  schedule: DaySchedule[];
  blockedDates: string[]; 
  blockedSlots: string[]; 
  contact: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    mapUrl: string;
    facebookUrl?: string; 
    instagramUrl?: string; 
    tiktokUrl?: string; 
  };
  emailConfig: EmailConfig;
  bankingInfo?: BankingInfo; 
}

export interface ClinicalNote {
  id: string;
  date: string;
  treatment: string;
  observations: string;
  productsUsed?: string[];
}

export interface ProgressPhoto {
    id: string;
    date: string;
    type: 'before' | 'after';
    url: string; 
    notes?: string;
}

export interface Patient {
  id: string;
  clientCode: string; 
  fileNumber: string; 
  fullName: string;
  password?: string; 
  birthDate: string; 
  email: string;
  phone: string;
  skinType: string;
  allergies: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  history: ClinicalNote[];
  progressPhotos?: ProgressPhoto[];
  clinicRecommendations?: string; 
  avatarUrl: string;
  registeredBy?: string; 
  registrationDate?: string; 
  assignedTherapist?: string; 
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; 
  time: string;
  service: string; 
  price?: number;
  discount?: number; 
  discountAppliedBy?: string; 
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  assignedTo?: string; 
  paymentVerified?: boolean; 
}

export interface TreatmentSuggestion {
  plan: string;
  products: string[];
  lifestyleAdvice: string;
}
