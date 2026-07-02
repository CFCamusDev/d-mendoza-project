-- AlterTable
ALTER TABLE `Order` MODIFY `deliveryPin` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `CreditNote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `returnRequestId` INTEGER NOT NULL,
    `type` ENUM('CREDIT_NOTE', 'STORE_CREDIT') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CreditNote_code_key`(`code`),
    UNIQUE INDEX `CreditNote_returnRequestId_key`(`returnRequestId`),
    INDEX `CreditNote_returnRequestId_idx`(`returnRequestId`),
    INDEX `CreditNote_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CreditNote` ADD CONSTRAINT `CreditNote_returnRequestId_fkey` FOREIGN KEY (`returnRequestId`) REFERENCES `ReturnRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
