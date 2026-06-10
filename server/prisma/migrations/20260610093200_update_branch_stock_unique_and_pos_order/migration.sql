-- AddForeignKey
ALTER TABLE `BranchStock` ADD CONSTRAINT `BranchStock_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PosOrder` ADD CONSTRAINT `PosOrder_sourceBranchId_fkey` FOREIGN KEY (`sourceBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
