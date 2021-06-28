export class MissingReflectMetadataError extends Error {
  constructor(error: Error) {
    super(`did yoy forget to import 'reflect-meatadata'? ": ${error.message}`)
  }
}

export class MissingPropertyArrayTypeError extends Error {
  constructor(className: string, propertyName: string) {
    super(
      `${className}.${propertyName} is Array of unknown type, first parameter of property when array must be type.`
    )
  }
}

export class InvalidTypePropertyError extends Error {
  constructor(className: string, propertyName: string) {
    super(`${className}.${propertyName} is Object, cannot reference this type`)
  }
}

export class UndeclaredSchemaPropertyError extends Error {}

export class AlreadyDeclaredIdError extends Error {}

export class NotFoundSchemaError extends Error {}
