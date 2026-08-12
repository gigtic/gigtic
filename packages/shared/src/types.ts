export type UserGender = 'Male' | 'Female' | 'Other' | 'Unspecified';
export type ServiceMode = 'Physical' | 'Digital';
export type ExchangePreference = 'DecideInChat' | 'RequesterCollects' | 'ProviderDropsOff';
export type JobStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELETED';

export interface User {
  id: string;
  realName: string;
  nickname: string;
  gender: UserGender;
  defaultRadiusKm: number;
  isAnywhereDefault: boolean;
  trustScore: number;
  bio?: string;
  skills?: string[];
  profileImageUrl?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  requesterId: string;
  providerId?: string;
  title: string;
  category: string;
  description: string;
  isIncognito: boolean;
  isWomenOnly: boolean;
  serviceMode: ServiceMode;
  radiusKm?: number;
  exchangePreference: ExchangePreference;
  budgetAmount?: number;
  isUrgent: boolean;
  referenceImages?: string[];
  status: JobStatus;
  requesterMarkedPaid: boolean;
  providerMarkedReceived: boolean;
  createdAt: string;
  completedAt?: string;
}
