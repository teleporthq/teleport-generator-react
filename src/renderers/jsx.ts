function parseForProps(content: any, isStyleObject?: boolean) {
  if (!content) return

  if (typeof content === 'string') {
    if (content.indexOf('$props.') === 0) {
      return `{${content.replace('$props.', 'this.props.')}}`
    } else {
      return `"${content}"`
    }
  } else {
    Object.keys(content).forEach((value) => {
      if (typeof content[value] === 'string') {
        if (content[value].indexOf('$props.') === 0) {
          content[value] = `\${${content[value].replace('$props.', 'this.props.')}}`
        }
      } else {
        parseForProps(content[value])
      }
    })

    if (isStyleObject) {
      return content
    }

    return isStyleObject ? content : `{${JSON.stringify(content)}}`
  }
}

export default function jsx(name: string, childrenJSX?: string, styles?: string, props?: any): string {
  let stylesString = ''
  if (styles) {
    stylesString = styles.length > 0 ? `style={${styles}}` : `style={[${styles}]}`
  }

  const propsArray = []
  if (props) {
    Object.keys(props).map((propName) => {
      const propValue = parseForProps(props[propName])
      propsArray.push(`${propName}={${JSON.stringify(propValue)}}`)
    })
  }

  const propsString = propsArray.length ? ' ' + propsArray.join(' ') : ''

  if (childrenJSX && childrenJSX.length > 0) {
    return `<${name} ${stylesString} ${propsString}>${childrenJSX}</${name}>`
  } else {
    return `<${name} ${stylesString} ${propsString}/>`
  }
}
