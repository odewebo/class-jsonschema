import { JSONSchema4 } from 'json-schema'

import {
  InvalidTypePropertyError,
  MissingPropertyArrayTypeError,
  MissingReflectMetadataError,
  UndeclaredSchemaPropertyError
} from './errors'

type Props = Omit<JSONSchema4, 'type'> & {
  required?: boolean
}

type ArrayProps = Pick<JSONSchema4, 'maxItems' | 'minItems' | 'uniqueItems'>

function property(props: Props): any
function property(type?: any, props?: Props, arrayProps?: ArrayProps): any

function property(typeOrProps?: any, props?: Props, arrayProps?: ArrayProps) {
  let type: Function

  if (typeof typeOrProps === 'function') {
    type = typeOrProps
  } else {
    props = typeOrProps
  }

  return function (target: any, name: string) {
    if ('__jsonSchemaProperties' in target === false) {
      target.__jsonSchemaProperties = {}
    }

    if ('__jsonSchemaRequired' in target === false) {
      target.__jsonSchemaRequired = []
    }

    let metadata

    try {
      // @ts-ignore
      metadata = Reflect.getMetadata('design:type', target, name)
    } catch (error) {
      if (error instanceof TypeError) {
        throw new MissingReflectMetadataError(error)
      }
    }

    if (metadata.name === 'Array' && type === undefined) {
      throw new MissingPropertyArrayTypeError(target.constructor.name, name)
    }

    if (metadata.name === 'Object') {
      throw new InvalidTypePropertyError(target.constructor.name, name)
    }

    if (
      props === undefined ||
      'required' in props === false ||
      props.required === true
    ) {
      target.__jsonSchemaRequired.push(name)
    }

    if (props && 'required' in props) {
      delete props.required
    }

    target.__jsonSchemaProperties[name] =
      metadata.name === 'Array'
        ? buildPropertyArray(type, props, arrayProps)
        : buildProperty(metadata, props)
  }
}

export default property

function buildProperty(type: Function, props?: Props) {
  // console.log('buildProperty', { name: type.name, type, props })

  switch (type.name) {
    case 'Number':
      return buildPropertyNumber(props)
    case 'String':
      return buildPropertyString(props)
    case 'Boolean':
      return buildPropertyBoolean(props)
    default:
      return buildCustomPropertyObject(type, props)
  }
}

function buildPropertyArray(
  type: Function,
  props?: Props,
  arrayProps?: ArrayProps
) {
  // console.log('buildPropertyArray', { type, props })

  return {
    type: 'array',
    items: buildProperty(type, props),
    ...arrayProps
  }
}

function buildPropertyNumber(props?: Props) {
  return {
    type: 'number',
    ...props
  }
}

function buildPropertyString(props?: Props) {
  return {
    type: 'string',
    ...props
  }
}

function buildPropertyBoolean(props?: Props) {
  return {
    type: 'boolean',
    ...props
  }
}

function buildCustomPropertyObject(type: Function, props?: Props) {
  // must check if have $id, if have $id use $ref, else copy schema, else throw error

  if ('__jsonSchema' in type.prototype === false) {
    throw new UndeclaredSchemaPropertyError(`${type}`)
  }

  if ('$id' in type.prototype.__jsonSchema) {
    return {
      $ref: type.prototype.__jsonSchema.$id
    }
  }

  return type.prototype.__jsonSchema
}
