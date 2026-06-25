export interface CreatePaymentIntentInputDTO {
  userId: number;
  cartId: number;
  addressId: number;
}

export interface CreatePaymentIntentResultDTO {
  clientSecret: string;
}

export interface ProcessWebhookInputDTO {
  payload: Buffer;
  signature: string;
}
