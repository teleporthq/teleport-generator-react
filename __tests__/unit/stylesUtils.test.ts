import { StylesUtils } from '../../src/utils'
import getFromLocal from './utils/getFromLocal'

const stylesData = getFromLocal('styles/data.json')

describe('Styles Utils', () => {
  it('should not detect dynamic style', () => {
    const { withoutDynamic } = stylesData
    const stylesSize = Object.keys(withoutDynamic).length

    const { dynamicStyles, staticStyles } = StylesUtils.detectDynamicStyle(withoutDynamic)
    expect(Object.keys(dynamicStyles).length).toBe(0)
    expect(Object.keys(staticStyles).length).toBe(stylesSize)
  })

  it('should detect dynamic style only', () => {
    const { dynamicOnly } = stylesData
    const stylesSize = Object.keys(dynamicOnly).length

    const { dynamicStyles, staticStyles } = StylesUtils.detectDynamicStyle(dynamicOnly)
    expect(Object.keys(dynamicStyles).length).toBe(stylesSize)
    expect(Object.keys(staticStyles).length).toBe(0)
  })

  it('should detect dynamic and static style', () => {
    const { withDynamic } = stylesData
    const stylesSize = Object.keys(withDynamic).length

    const { dynamicStyles, staticStyles } = StylesUtils.detectDynamicStyle(withDynamic)
    expect(Object.keys(dynamicStyles).length).toBe(stylesSize - 1)
    expect(Object.keys(staticStyles).length).toBe(stylesSize)
  })

  it('should get inline styles for empty style object', () => {
    const { styleMaps, styleString } = StylesUtils.generateInlineStyleForElement('test', {})
    expect(styleMaps).toBeFalsy()
    expect(styleString).toBe('')
  })

  it('should get inline style', () => {
    const { withDynamic } = stylesData
    const { dynamicStyles } = StylesUtils.detectDynamicStyle(withDynamic)
    const { styleMaps, styleString } = StylesUtils.generateInlineStyleForElement('test', dynamicStyles)

    expect(styleMaps.length).toBe(Object.keys(dynamicStyles).length)
    expect(typeof styleString).toBe('string')
    expect(styleString.length).toBeGreaterThan(0)
  })
})
