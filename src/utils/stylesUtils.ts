import { PROPS_KEY, THIS_PROPS } from '../constants'
import { GeneralUtils } from './'

export default class StylesUtils {
  public static detectDynamicStyle(styles: any): any {
    const dynamicStyles = {}
    const staticStyles = {}

    Object.keys(styles).forEach((style) => {
      const { dynamicStyle, staticStyle } = extractDynamicPropsFromStyle(styles[style])
      if (Object.keys(dynamicStyle).length) {
        dynamicStyles[style] = dynamicStyle
      }
      if (Object.keys(staticStyle).length) {
        staticStyles[style] = staticStyle
      }
    })

    return { dynamicStyles, staticStyles }
  }

  public static generateInlineStyleForElement(elementName: string, style: any): any {
    if (!Object.keys(style).length) {
      return { styleName: null, styleString: '' }
    }

    const elementStyle = Object.keys(style)
      .map((className) => computeInlineStyleValueMap(style, className))
      .reduce((acc, val) => acc.concat(val), [])
      .join(',\n')

    const styleName = `${GeneralUtils.lowerFirst(elementName)}Style`
    const styleString = `const ${styleName} = {\n ${elementStyle}\n }`

    return { styleName, styleString }
  }
}

function extractDynamicPropsFromStyle(style: any): any {
  const dynamicStyle = {}
  const staticStyle = {}

  Object.keys(style).forEach((styleKey) => {
    const stylePropIsDynamic = JSON.stringify(style[styleKey]).indexOf(PROPS_KEY) >= 0
    if (stylePropIsDynamic) {
      dynamicStyle[styleKey] = style[styleKey]
    } else {
      staticStyle[styleKey] = style[styleKey]
    }
  })
  return { dynamicStyle, staticStyle }
}

function computeInlineStyleValueMap(style: any, className: string): any {
  const classStyle = style[className]
  return Object.keys(classStyle).map((jssProp) => {
    return `${jssProp}: ${classStyle[jssProp].replace(PROPS_KEY, THIS_PROPS)}`
  })
}
