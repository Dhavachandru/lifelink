export type IncidentType = 'VEHICLE_BREAKDOWN' | 'VEHICLE_ACCIDENT' | 'HOME' | 'TRAVEL' | 'DOCUMENTS' | 'DEVICE';
export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'REPORTED' | 'ASSESSING' | 'DISPATCHED' | 'RESOLVING' | 'RESOLVED' | 'CANCELLED';
export type ActionCategory = 'IMMEDIATE_SAFETY' | 'RECOMMENDED_ACTION' | 'EVIDENCE_COLLECTION' | 'DOCUMENT_CHECK';
export type DocumentType = 'INSURANCE' | 'PUC' | 'REGISTRATION' | 'WARRANTY' | 'SERVICE_INVOICE' | 'OTHER';
export type ProviderType = 'TOWING' | 'BATTERY_JUMP' | 'TIRE_CHANGE' | 'MOBILE_MECHANIC' | 'EMERGENCY_MEDICAL_HOTLINE' | 'POLICE_NON_EMERGENCY';
export type NotificationType = 'INCIDENT_ALERT' | 'DOCUMENT_EXPIRY' | 'PROVIDER_UPDATE' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  fuelType?: string;
  insurancePolicyNumber?: string;
  insuranceProvider?: string;
  insuranceExpiryDate?: string;
  pucExpiryDate?: string;
  warrantyExpiryDate?: string;
  primary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  documentType: DocumentType;
  documentNumber?: string;
  expiryDate?: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface VehicleServiceRecord {
  id: string;
  vehicleId: string;
  serviceDate: string;
  mileage?: number;
  serviceCenter?: string;
  description: string;
  cost?: number;
  invoiceFileKey?: string;
  createdAt: string;
}

export interface IncidentAction {
  id: string;
  stepOrder: number;
  title: string;
  description: string;
  actionCategory: ActionCategory;
  completed: boolean;
  updatedAt?: string;
}

export interface IncidentEvent {
  id: string;
  eventType: string;
  actorType: 'USER' | 'SYSTEM' | 'AI' | 'PROVIDER';
  title: string;
  description: string;
  createdAt: string;
}

export interface IncidentAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  attachmentType: string;
  notes?: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  userId: string;
  vehicleId?: string;
  vehicleInfo?: string;
  incidentType: IncidentType;
  urgency: UrgencyLevel;
  status: IncidentStatus;
  title: string;
  description: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  locationSharedExplicitly: boolean;
  summary?: string;
  assistanceNeed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentDetail extends Incident {
  vehicle?: Vehicle;
  aiAssessmentJson?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  actions: IncidentAction[];
  events: IncidentEvent[];
  attachments: IncidentAttachment[];
}

export interface AssistanceProvider {
  id: string;
  name: string;
  providerType: ProviderType;
  phoneNumber: string;
  rating: number;
  estimatedEtaMinutes: number;
  serviceArea: string;
  demo: boolean;
  active: boolean;
}

export interface AssistanceRequest {
  id: string;
  incidentId: string;
  provider: AssistanceProvider;
  status: string;
  requestedAt: string;
  confirmedAt?: string;
  providerNotes?: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  primary: boolean;
  notifyOnIncident: boolean;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  notificationEmail: boolean;
  notificationSms: boolean;
  pushNotifications: boolean;
  shareLocationDefault: boolean;
  darkMode: boolean;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  read: boolean;
  incidentId?: string;
  createdAt: string;
}

export interface IncidentAssessmentResponse {
  incidentType: IncidentType;
  urgency: UrgencyLevel;
  summary: string;
  immediateSafetySteps: string[];
  recommendedActions: string[];
  clarifyingQuestions: string[];
  evidenceToCollect: string[];
  documentsToCheck: string[];
  assistanceNeed: string;
  disclaimer: string;
  evaluatedBy: string;
}
