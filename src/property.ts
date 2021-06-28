import {
  InvalidTypePropertyError,
  MissingPropertyArrayTypeError,
  MissingReflectMetadataError
} from './errors'

interface Props {
  required: boolean
}

function property(props: Props): any
function property(type?: any, props?: Props): any

function property(typeOrProps?: any, props?: Props) {
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

    if (props === undefined || props.required === true) {
      target.__jsonSchemaRequired.push(name)
    }

    target.__jsonSchemaProperties[name] =
      metadata.name === 'Array'
        ? buildPropertyArray(type, props)
        : buildProperty(metadata, props)
  }
}

export default property

function buildProperty(type: Function, props?: Props) {
  // console.log('buildProperty', { name: type.name, type, props })

  switch (type.name) {
    case 'Number':
      return buildPropertyNumber()
    case 'String':
      return buildPropertyString()
    case 'Boolean':
      return buildPropertyBoolean()
    default:
      return buildCustomPropertyObject()
  }
}

function buildPropertyArray(type: Function, props?: Props) {
  // console.log('buildPropertyArray', { type, props })

  return {
    type: 'array',
    items: buildProperty(type, props)
  }
}

function buildPropertyNumber() {
  return {
    type: 'number'
  }
}

function buildPropertyString() {
  return {
    type: 'string'
  }
}

function buildPropertyBoolean() {
  return {
    type: 'boolean'
  }
}

function buildCustomPropertyObject() {}
