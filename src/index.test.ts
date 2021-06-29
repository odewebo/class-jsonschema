import property from './property'
import schema, { getById } from './schema'

import 'reflect-metadata'
import { expect } from 'chai'
import { AlreadyDeclaredIdError, MissingPropertyArrayTypeError } from './errors'

describe('index', () => {
  it('basic type schema', (done) => {
    @schema()
    class Test1 {
      @property({ required: false })
      a?: number

      @property(String, { required: true })
      b!: string[]

      @property()
      c!: boolean
    }

    expect(Test1.prototype.__jsonSchema).to.deep.contains({
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
    class Test2 {}

    expect(Test2.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      $id: 'Test',
      title: 'Test',
      description: 'Test Object'
    })

    done()
  })

  it('string property schema setting', (done) => {
    @schema()
    class Test3 {
      @property({
        minLength: 3,
        maxLength: 5
      })
      a: string
    }

    expect(Test3.prototype.__jsonSchema).to.deep.contains({
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
    class A1 {
      @property()
      a: string
    }

    @schema()
    class B1 {
      @property()
      a: A1

      @property()
      b: string
    }

    expect(B1.prototype.__jsonSchema).to.deep.contains({
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
    @schema({ $id: 'A2#ref' })
    class A2 {
      @property()
      a: string
    }

    @schema()
    class B2 {
      @property()
      a: A2

      @property()
      b: string
    }

    expect(B2.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: {
          $ref: 'A2#ref'
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
    class Test4 {
      @property(Number, { minLength: 1 }, { minItems: 3 })
      a: string[]
    }

    expect(Test4.prototype.__jsonSchema).to.deep.contains({
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

  it('extended class', (done) => {
    @schema()
    class A3 {
      @property()
      a: string
    }

    @schema()
    class B3 extends A3 {
      @property()
      b: string
    }

    expect(B3.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: {
          type: 'string'
        },
        b: {
          type: 'string'
        }
      }
    })

    done()
  })

  it('extend multiple class', (done) => {
    @schema()
    class A4 {
      @property()
      a: string
    }

    @schema()
    class B4 extends A4 {
      @property()
      b: string
    }

    @schema()
    class C4 extends B4 {
      @property()
      c: string
    }

    expect(C4.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['a', 'b', 'c'],
      properties: {
        a: {
          type: 'string'
        },
        b: {
          type: 'string'
        },
        c: {
          type: 'string'
        }
      }
    })

    done()
  })

  it('check registration', (done) => {
    @schema({ $id: 'Retrive#1' })
    class A5 {}

    expect(A5).to.be.equal(getById('Retrive#1'))

    done()
  })

  it('check collision', (done) => {
    expect(() => {
      @schema({ $id: 'UniqueCollision#1' })
      class TestT1 {}

      @schema({ $id: 'UniqueCollision#1' })
      class TestT2 {}
    }).to.throw(AlreadyDeclaredIdError)

    done()
  })

  it('generic interface', (done) => {
    interface O<T> {
      t: T
    }

    @schema()
    class Generic1 implements O<number> {
      @property()
      t: number
    }

    @schema()
    class Generic2 implements O<string> {
      @property()
      t: string
    }

    expect(Generic1.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['t'],
      properties: {
        t: {
          type: 'number'
        }
      }
    })

    expect(Generic2.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['t'],
      properties: {
        t: {
          type: 'string'
        }
      }
    })

    done()
  })

  it('generic class', (done) => {
    @schema()
    class GenericClass1<T> {
      // @property() # not usable with generic :(
      t: T
    }

    @schema()
    class Generic3 extends GenericClass1<number> {
      @property()
      t: number
    }

    @schema()
    class Generic4 extends GenericClass1<string> {
      @property()
      t: string
    }

    expect(Generic3.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['t'],
      properties: {
        t: {
          type: 'number'
        }
      }
    })

    expect(Generic4.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['t'],
      properties: {
        t: {
          type: 'string'
        }
      }
    })

    done()
  })

  it('array of custom type', (done) => {
    @schema()
    class Custom1 {
      @property()
      p!: string
    }

    @schema()
    class Test5 {
      @property(Custom1)
      customs: Custom1[]
    }

    expect(Test5.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['customs'],
      properties: {
        customs: {
          type: 'array',
          items: {
            type: 'object',
            required: ['p'],
            properties: {
              p: {
                type: 'string'
              }
            }
          }
        }
      }
    })

    done()
  })

  it('declaring type of non array prop', (done) => {
    @schema()
    class Test6 {
      @property(String)
      p!: string
    }

    expect(Test6.prototype.__jsonSchema).to.deep.contains({
      type: 'object',
      required: ['p'],
      properties: {
        p: {
          type: 'string'
        }
      }
    })

    done()
  })

  it('missing type declaration of array', (done) => {
    expect(() => {
      @schema()
      class Test7 {
        @property()
        p!: string[]
      }
    }).to.throw(MissingPropertyArrayTypeError)

    done()
  })
})
