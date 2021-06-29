import { JSONSchema4 } from 'json-schema'
import { AlreadyDeclaredIdError, NotFoundSchemaError } from './errors'

type JSONSchema4Props = Pick<
  JSONSchema4,
  '$id' | '$schema' | 'title' | 'description'
>

const schemaMap: Record<string, Function> = {}

export default function schema(props?: JSONSchema4Props) {
  return function (target: Function) {
    target.prototype.__jsonSchema = Object.entries({
      $id: props?.$id,
      $schema: props?.$schema,
      title: props?.title,
      description: props?.description,
      required: target.prototype.__jsonSchemaRequired,
      properties: target.prototype.__jsonSchemaProperties,
      type: 'object'
    })
      .filter(([key, val]) => val !== undefined)
      .reduce((acc, [key, val]) => {
        acc[key] = val

        return acc
      }, {} as any)

    if ('$id' in target.prototype.__jsonSchema) {
      // schemaId[$id]
      if (target.prototype.__jsonSchema.$id in schemaMap) {
        if (target !== schemaMap[target.prototype.__jsonSchema.$id]) {
          throw new AlreadyDeclaredIdError(target.prototype.__jsonSchema.$id)
        }
      }

      schemaMap[target.prototype.__jsonSchema.$id] = target
    }

    Object.seal(target.prototype.__jsonSchema)
    // delete target.prototype.__jsonSchemaRequired
    // delete target.prototype.__jsonSchemaProperties
  }
}

export function getById(id: string) {
  if (id in schemaMap === false) {
    throw new NotFoundSchemaError(id)
  }

  return schemaMap[id]
}
