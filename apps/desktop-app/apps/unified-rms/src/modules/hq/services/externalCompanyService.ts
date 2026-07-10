import api from '../utils/api';

export interface ExternalCompany {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const externalCompanyService = {
  getAll: async (): Promise<ExternalCompany[]> => {
    try {
      const response = await api.get<ExternalCompany[]>('/ExternalCompanies');
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  create: async (company: Omit<ExternalCompany, 'id'>): Promise<ExternalCompany> => {
    const response = await api.post<ExternalCompany>('/ExternalCompanies', company);
    return response.data;
  },

  update: async (id: string, company: Partial<ExternalCompany>): Promise<ExternalCompany> => {
    const response = await api.put<ExternalCompany>(`/ExternalCompanies/${id}`, company);
    return response.data;
  }
};
