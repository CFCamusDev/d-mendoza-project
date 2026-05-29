export interface AttributeValue {
  id: number;
  value: string;
  isActive: boolean;
  attributeId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attribute {
  id: number;
  name: string;
  isActive: boolean;
  values?: AttributeValue[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAttributeDTO { name: string; }
export interface CreateAttributeValueDTO { value: string; attributeId: number; }
