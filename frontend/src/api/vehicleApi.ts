import apiClient from './client';
import { Vehicle, VehicleDocument, VehicleServiceRecord, DocumentType } from '../types';

export const vehicleApi = {
  getAll: (): Promise<Vehicle[]> => {
    return apiClient<Vehicle[]>('/vehicles');
  },

  getById: (id: string): Promise<Vehicle> => {
    return apiClient<Vehicle>(`/vehicles/${id}`);
  },

  create: (data: {
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
    primary?: boolean;
  }): Promise<Vehicle> => {
    return apiClient<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    return apiClient<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<any> => {
    return apiClient(`/vehicles/${id}`, { method: 'DELETE' });
  },

  getDocuments: (vehicleId: string): Promise<VehicleDocument[]> => {
    return apiClient<VehicleDocument[]>(`/vehicles/${vehicleId}/documents`);
  },

  uploadDocument: (vehicleId: string, file: File, documentType: DocumentType, documentNumber?: string, expiryDate?: string): Promise<VehicleDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (documentNumber) formData.append('documentNumber', documentNumber);
    if (expiryDate) formData.append('expiryDate', expiryDate);

    return apiClient<VehicleDocument>(`/vehicles/${vehicleId}/documents`, {
      method: 'POST',
      body: formData,
    });
  },

  deleteDocument: (docId: string): Promise<any> => {
    return apiClient(`/vehicles/documents/${docId}`, { method: 'DELETE' });
  },

  getServices: (vehicleId: string): Promise<VehicleServiceRecord[]> => {
    return apiClient<VehicleServiceRecord[]>(`/vehicles/${vehicleId}/services`);
  },

  addService: (vehicleId: string, data: {
    serviceDate: string;
    mileage?: number;
    serviceCenter?: string;
    description: string;
    cost?: number;
  }): Promise<VehicleServiceRecord> => {
    return apiClient<VehicleServiceRecord>(`/vehicles/${vehicleId}/services`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
