import { Injectable } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class JobValidatorFactory {
  private validatorsMap = new Map<string, ZodSchema>();

  public registerValidator(type: string, validator: ZodSchema): void {
    this.validatorsMap.set(type.toLowerCase(), validator);
  }

  public getValidator(type: string): ZodSchema | null {
    return this.validatorsMap.get(type.toLowerCase()) ?? null;
  }
}
