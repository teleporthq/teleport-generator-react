import { PropsUtils } from '../../src/utils'
import { PROPS_KEY } from '../../src/constants'
import getFromLocal from './utils/getFromLocal'

const data = getFromLocal('props/data.json')

describe('Props Utils', () => {
  it('should not parse for prop is content is empty', () => {
    const result = PropsUtils.parseForProps(null)
    expect(result).toBe('')
  })

  it('should find prop in string content', () => {
    const { stringContentWithProps } = data
    const indexOfProp = stringContentWithProps.indexOf(PROPS_KEY)
    expect(indexOfProp).toBeGreaterThan(-1)

    const result = PropsUtils.parseForProps(stringContentWithProps)
    expect(typeof result).toBe('string')

    const indefOfPropInRes = result.indexOf(PROPS_KEY)
    expect(indefOfPropInRes).toBe(-1)
  })

  it('should not find prop in string content', () => {
    const { stringContentWithoutProps } = data
    const indexOfProp = stringContentWithoutProps.indexOf(PROPS_KEY)
    expect(indexOfProp).toBe(-1)

    const result = PropsUtils.parseForProps(stringContentWithoutProps)
    expect(result).toBe(`"${stringContentWithoutProps}"`)

    const indefOfPropInRes = result.indexOf(PROPS_KEY)
    expect(indefOfPropInRes).toBe(-1)
  })

  it('should find prop in simple content structure', () => {
    const { simpleContentWithProps } = data
    const initialIndexOfProps = JSON.stringify(simpleContentWithProps).indexOf(PROPS_KEY)
    expect(initialIndexOfProps).toBeGreaterThan(-1)

    const result = PropsUtils.parseForProps(simpleContentWithProps)
    expect(typeof result).toBe('string')

    const resultIndexOfProps = result.indexOf(PROPS_KEY)
    expect(resultIndexOfProps).toBe(-1)
  })

  it('should not find prop in simple content structure', () => {
    const { simpleContentWithoutProps } = data
    const initialIndexOfProps = JSON.stringify(simpleContentWithoutProps).indexOf(PROPS_KEY)
    expect(initialIndexOfProps).toBe(-1)

    const result = PropsUtils.parseForProps(simpleContentWithoutProps)
    expect(typeof result).toBe('string')
  })

  it('should find prop in complex content structure', () => {
    const { contentWithProps } = data
    const initialIndexOfProps = JSON.stringify(contentWithProps).indexOf(PROPS_KEY)
    expect(initialIndexOfProps).toBeGreaterThan(-1)

    const result = PropsUtils.parseForProps(contentWithProps)
    const resultIndexOfProps = result.indexOf(PROPS_KEY)
    expect(resultIndexOfProps).toBe(-1)
  })
})
