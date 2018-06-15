import * as _ from 'lodash'

const renderDependency = (libraryName, types) => {
  const path = libraryName.indexOf('components/') === -1
    ? ''
    : '../'
  return `import ${types.join(', ')} from '${path}${libraryName}'`
}

export default function component(name: string, jsx: string, dependencies: any = {}, styles, props): any {
  // tslint:disable-next-line:max-line-length
  const dependenciesArray = Object.keys(dependencies).map(libraryName => renderDependency(libraryName, dependencies[libraryName] ))


  let propsString = ''
  if (props && props.length > 0) {
    propsString = `const { ${props.join(', ')} } = this.props`
  }

  let stylesString = ''
  if (styles) {
    const styleNames = Object.keys(styles)
    if (styleNames && styleNames.length) {
      const stylesArray = []
      styleNames.map(styleName => {
        let styleLinesArray = JSON.stringify(styles[styleName], null, 4).split('\n')
        // filter out the empty lines
        styleLinesArray = styleLinesArray.filter(styleLine => styleLine.length)
        // add the first line in the same line as the name; it will be the opening "{" of the definition
        stylesArray.push(`${styleName}: ${styleLinesArray[0]}`)
        // add the rest of the lines, except the last
        // tslint:disable-next-line:max-line-length
        styleLinesArray.slice(1, styleLinesArray.length - 1).map(stylePropertyString => { stylesArray.push(stylePropertyString) })
        // add the last line, as it needs an extra coma at the end
        stylesArray.push(`${styleLinesArray[styleLinesArray.length - 1]},`)
      })

      stylesString = `
        const styles = {
          ${stylesArray.join('\n  ')}
        }
      `
    }
  }

  return `
    import React, { Component } from 'react'
    ${dependenciesArray.join(``)}

    export default class ${_.upperFirst(name)} extends Component {
      render () {
        ${propsString}
        return (
          ${jsx}
        )
      }
    }

    ${stylesString}
  `
}
