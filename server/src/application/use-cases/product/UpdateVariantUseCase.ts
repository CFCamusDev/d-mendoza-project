import { IProductVariantRepository } from '@domain/repositories/IProductVariantRepository';
import { UpdateVariantRequestDTO, VariantResponseDTO } from '../../dtos/ProductVariantDTOs';
import { ProductVariant } from '@domain/entities/ProductVariant';

/**
 * UpdateVariantUseCase — T-078
 *
 * Permite editar el precio y/o SKU de una variante individual.
 * Valida unicidad de SKU en Prisma antes de guardar para evitar colisiones.
 */
export class UpdateVariantUseCase {
  constructor(private readonly variantRepository: IProductVariantRepository) {}

  async execute(id: number, dto: UpdateVariantRequestDTO): Promise<VariantResponseDTO> {
    // 1. Verificar que la variante existe
    const variant = await this.variantRepository.findById(id);
    if (!variant) {
      throw new Error('La variante no existe');
    }

    // 2. Si se quiere cambiar el SKU, verificar que no esté en uso por otra variante
    if (dto.sku && dto.sku !== variant.sku) {
      // Normalizar SKU: mayúsculas y sin espacios
      dto.sku = dto.sku.toUpperCase().trim();
      const existing = await this.variantRepository.findBySku(dto.sku);
      if (existing && existing.id !== id) {
        throw new Error(`El SKU "${dto.sku}" ya está asignado a otra variante`);
      }
    }

    // 3. Validar precio si se proporciona
    if (dto.price !== undefined && dto.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    const updated = await this.variantRepository.update(id, dto);
    return this.mapToDTO(updated);
  }

  private mapToDTO(variant: ProductVariant): VariantResponseDTO {
    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      price: variant.price,
      attributesJson: variant.attributesJson,
      isActive: variant.isActive,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }
}
