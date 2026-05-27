/**
 * Domain Entity: BrandConfig
 * Representa la configuración de identidad visual del sistema.
 */
export interface BrandConfig {
  id: number;
  brandName: string;
  logoUrl: string | null;
  primaryColor: string;
  socialLinksJson: Record<string, string>;
  updatedAt: Date;
}

/**
 * Valores por defecto para la identidad visual del sistema (Singleton Object).
 * Se utilizan cuando no existe una configuración personalizada en la base de datos.
 */
export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  id: 1,
  brandName: "D'Mendoza",
  logoUrl: null,
  primaryColor: "#4F46E5",
  socialLinksJson: {},
  updatedAt: new Date(),
};
