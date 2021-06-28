import property from './property'
import schema from './schema'

import 'reflect-metadata'
import { expect } from 'chai'

describe('index', () => {
  it('basic type schema', (done) => {
    @schema
    class Test {
      @property({ required: false })
      a?: number

      @property(String, { required: true })
      b!: string[]

      @property()
      c!: boolean
    }

    expect(Test.prototype.__jsonSchema).to.deep.equal({
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
})
