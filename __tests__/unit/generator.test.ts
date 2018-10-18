import { FileSet, Generator, Target } from '@teleporthq/teleport-lib-js'
import TeleportGeneratorReact from '../../src'

describe('React generator', () => {
  it('should return a generator', () => {
    const generator = new TeleportGeneratorReact()
    expect(generator).toBeInstanceOf(Generator)
    expect(generator.targetName).toBe('react')
  })
})
