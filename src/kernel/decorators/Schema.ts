import z from "zod";
import "reflect-metadata";

const SCHEMA_METADATA_KEY = 'custon:schema';

export function Schema(schema: z.ZodSchema): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(SCHEMA_METADATA_KEY, schema, target);
  };
}

export function getSchema(target: any): z.ZodSchema | undefined {
  return Reflect.getMetadata(SCHEMA_METADATA_KEY, target.constructor);
}
