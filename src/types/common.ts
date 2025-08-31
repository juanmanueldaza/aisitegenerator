/**
 * Common types used across the application
 * Following SOLID principles and best practices
 */

// Base entity with audit fields
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Timestamp tracking for entities
export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

// Soft delete support
export interface SoftDeletable {
  deletedAt?: Date;
  isDeleted?: boolean;
}

// Status types for async operations
export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

// Generic result wrapper for operations
export interface OperationResult<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Sort options
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// Filter options
export interface FilterOption {
  field: string;
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'nin'
    | 'contains'
    | 'startsWith'
    | 'endsWith';
  value: unknown;
}

// Search parameters
export interface SearchParams {
  query?: string;
  filters?: FilterOption[];
  sort?: SortOption[];
  pagination?: PaginationParams;
}

// API Response with enhanced typing
export interface ApiResponse<T = unknown, E = ApiError> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
  timestamp?: Date;
  requestId?: string;
}

// Enhanced error interface following Interface Segregation
export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
  field?: string;
  timestamp?: Date;
}

// Validation error for form fields
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Configuration interface for services
export interface ServiceConfig {
  enabled: boolean;
  timeout?: number;
  retries?: number;
  baseUrl?: string;
}

// Event system interfaces
export interface BaseEvent {
  type: string;
  timestamp: Date;
  source?: string;
}

export interface EventHandler<T extends BaseEvent = BaseEvent> {
  handle(event: T): void | Promise<void>;
}

// Generic repository pattern interface
export interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findAll(params?: SearchParams): Promise<PaginatedResponse<T>>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  count(params?: SearchParams): Promise<number>;
}

// Generic service interface following Interface Segregation
export interface CrudService<T extends BaseEntity> {
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<T>>;
  read(id: string): Promise<OperationResult<T>>;
  update(id: string, updates: Partial<T>): Promise<OperationResult<T>>;
  delete(id: string): Promise<OperationResult<void>>;
  list(params?: SearchParams): Promise<OperationResult<PaginatedResponse<T>>>;
}

// Cache interface for performance optimization
export interface Cache<T = unknown> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

// Logger interface following Interface Segregation
export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

// Notification system interfaces
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  actionUrl?: string;
}

export interface NotificationService {
  notify(notification: Omit<Notification, 'id' | 'timestamp'>): void;
  markAsRead(id: string): void;
  clearAll(): void;
  getUnreadCount(): number;
}
