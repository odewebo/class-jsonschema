export default function schema(target: Function) {
  // console.log('schema', target.prototype.__jsonSchemaProperties)
  target.prototype.__jsonSchema = {
    required: target.prototype.__jsonSchemaRequired,
    properties: target.prototype.__jsonSchemaProperties
  }
}
