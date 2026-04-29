/**
 * Domain Entity: AuditLog
 * Representa un registro de auditoría inmutable.
 * RF-84: Log de auditoría para acciones críticas.
 */
export interface AuditLog {
  id: number;
  action: string;
  module: string;
  details: Record<string, unknown> | null;
  userId: number | null;
  createdAt: Date;
}

/**
 * DTO para crear un nuevo registro de auditoría.
 */
export interface CreateAuditLogDTO {
  action: string;
  module: string;
  userId?: number;
  details?: Record<string, unknown>;
}

/**
 * DTO para la respuesta de un registro de auditoría.
 */
export interface AuditLogResponseDTO {
  id: number;
  action: string;
  module: string;
  details: Record<string, unknown> | null;
  userId: number | null;
  createdAt: Date;
}

/**
 * Filtros opcionales para consultar logs de auditoría.
 */
export interface AuditLogFilters {
  module?: string;
  action?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
}
