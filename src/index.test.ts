import property from './property'
import schema from './schema'

import 'reflect-metadata'
import { expect } from 'chai'

describe('index', () => {
  it('basic type schema', (done) => {
    @schema()
    class Test {
      @property({ required: false })
      a?: number

      @property(String, { required: true })
      b!: string[]

      @property()
      c!: boolean
    }

    expect(Test.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['b', 'c'],
      properties: {
        a: {
          type: 'number'
        },
        b: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        c: {
          type: 'boolean'
        }
      }
    })

    done()
  })

  it('property schema test', (done) => {
    @schema({ $id: 'Test', title: 'Test', description: 'Test Object' })
    class Test {}

    expect(Test.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      $id: 'Test',
      title: 'Test',
      description: 'Test Object'
    })

    done()
  })

  it('string property schema setting', (done) => {
    @schema()
    class Test {
      @property({
        minLength: 3,
        maxLength: 5
      })
      a: string
    }

    expect(Test.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['a'],
      properties: {
        a: {
          type: 'string',
          minLength: 3,
          maxLength: 5
        }
      }
    })

    done()
  })

  it('schema in schema', (done) => {
    @schema()
    class A {
      @property()
      a: string
    }

    @schema()
    class B {
      @property()
      a: A

      @property()
      b: string
    }

    expect(B.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: {
          type: 'object',
          required: ['a'],
          properties: {
            a: {
              type: 'string'
            }
          }
        },
        b: {
          type: 'string'
        }
      }
    })

    done()
  })

  it('schema ref schema', (done) => {
    @schema({ $id: 'A#ref' })
    class A {
      @property()
      a: string
    }

    @schema()
    class B {
      @property()
      a: A

      @property()
      b: string
    }

    expect(B.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: {
          $ref: 'A#ref'
        },
        b: {
          type: 'string'
        }
      }
    })

    done()
  })

  it('array rules', (done) => {
    @schema()
    class Test {
      @property(Number, { minLength: 1 }, { minItems: 3 })
      a: string[]
    }

    expect(Test.prototype.__jsonSchema).to.deep.contains({
      required: ['a'],
      type: 'object',
      properties: {
        a: {
          type: 'array',
          minItems: 3,
          items: {
            type: 'number',
            minLength: 1
          }
        }
      }
    })

    done()
  })
})
