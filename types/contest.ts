import { ContestType, ContestStatus, ContestRole, ParticipationStatus, SubmissionStatus } from '@prisma/client'

export interface Contest {
  id: string
  name: string
  slug: string
  description?: string
  type: ContestType
  status: ContestStatus
  registrationStart: Date
  registrationEnd: Date
  contestStart: Date
  contestEnd: Date
  resultsPublished?: Date
  maxParticipants?: number
  entryFee?: number
  rules?: string
  prizes?: string
  isPublic: boolean
  isFeatured: boolean
  bannerImage?: string
  createdAt: Date
  updatedAt: Date
  companyId: string
  company: {
    id: string
    nombre: string
    slug: string
  }
}

export interface ContestCategory {
  id: string
  name: string
  description?: string
  order: number
  ageMin?: number
  ageMax?: number
  sexo?: string
  productType?: string
  weightMin?: number
  weightMax?: number
  maxEntries?: number
  contestId: string
}

export interface ContestParticipation {
  id: string
  status: ParticipationStatus
  registeredAt: Date
  approvedAt?: Date
  notes?: string
  userId: string
  contestId: string
  user: {
    id: string
    nombre?: string
    email: string
  }
}

export interface ContestSubmission {
  id: string
  title: string
  description?: string
  status: SubmissionStatus
  metadata?: any
  submittedAt?: Date
  createdAt: Date
  updatedAt: Date
  participationId: string
  categoryId: string
  ganadoId?: string
  category: ContestCategory
  media: SubmissionMedia[]
}

export interface SubmissionMedia {
  id: string
  type: string
  url: string
  filename: string
  mimeType: string
  size: number
  isPrimary: boolean
  caption?: string
  submissionId: string
}

export interface JudgingCriteria {
  id: string
  name: string
  description?: string
  weight: number
  maxScore: number
  order: number
  contestId?: string
  categoryId?: string
}

export interface JudgingScore {
  id: string
  score: number
  comments?: string
  scoredAt: Date
  judgeId: string
  submissionId: string
  criteriaId: string
  judge: {
    id: string
    nombre?: string
    email: string
  }
  criteria: JudgingCriteria
}

export interface ContestFormData {
  name: string
  slug: string
  description?: string
  type: ContestType
  registrationStart: Date
  registrationEnd: Date
  contestStart: Date
  contestEnd: Date
  maxParticipants?: number
  entryFee?: number
  rules?: string
  prizes?: string
  isPublic: boolean
  isFeatured: boolean
  bannerImage?: string
  companyId: string
}

export interface CategoryFormData {
  name: string
  description?: string
  order: number
  ageMin?: number
  ageMax?: number
  sexo?: string
  productType?: string
  weightMin?: number
  weightMax?: number
  maxEntries?: number
}

export interface SubmissionFormData {
  title: string
  description?: string
  categoryId: string
  ganadoId?: string
  metadata?: any
}

export interface CriteriaFormData {
  name: string
  description?: string
  weight: number
  maxScore: number
  order: number
}

// Utility types for API responses
export interface ContestListResponse {
  contests: Contest[]
  total: number
  page: number
  pageSize: number
}

export interface ParticipationListResponse {
  participations: ContestParticipation[]
  total: number
  page: number
  pageSize: number
}

export interface SubmissionListResponse {
  submissions: ContestSubmission[]
  total: number
  page: number
  pageSize: number
}

// Contest statistics
export interface ContestStats {
  totalParticipants: number
  totalSubmissions: number
  submissionsByCategory: { [categoryId: string]: number }
  participationsByStatus: { [status: string]: number }
  submissionsByStatus: { [status: string]: number }
}