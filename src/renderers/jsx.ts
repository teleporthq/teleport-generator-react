export default function jsx(name: string, childrenJSX?: string, styles?: string, props?: any): string {
  let stylesString = ''
  if (styles) {
    if (styles.length > 0) {
      stylesString = `style={${styles}}`
    } else {
      stylesString = `style={[${styles}]}`
    }
  }

  const propsArray = []
  if (props) {
    Object.keys(props).map(propName => {
      const propValue = props[propName]
      propsArray.push(`${propName}={${JSON.stringify(propValue)}}`)
    })
  }

  const propsString = (propsArray.length ? ' ' + propsArray.join(' ') : '')

  if (childrenJSX && childrenJSX.length > 0) {
    return `<${name} ${stylesString} ${propsString}>${childrenJSX}</${name}>`
  } else {
    return `<${name} ${stylesString} ${propsString}/>`
  }
}
