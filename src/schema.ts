import { JSONSchema4 } from 'json-schema'

type JSONSchema4Props = Pick<
  JSONSchema4,
  '$id' | '$schema' | 'title' | 'description'
>

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
  }
}
