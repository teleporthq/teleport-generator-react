import { ComponentCodeGenerator, FileSet, Target, ComponentGeneratorOptions } from '@teleporthq/teleport-lib-js'
import { Content } from '@teleporthq/teleport-lib-js/dist/types'
import upperFirst from 'lodash/upperFirst'

/** @TODO: check */
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

function renderJsx(name: string, className: string, childrenJSX?: string, props?: any, options?: ComponentGeneratorOptions): string {
  /** @TODO: verify if this still works; it should retrieve a props value */
  const propsArray = []
  if (props) {
    Object.keys(props).map((propName) => {
      const propValue = parseForProps(props[propName])
      propsArray.push(`${propName}={${JSON.stringify(propValue)}}`)
    })
  }

  /** prepare the props value string */
  /** @TODO: check */
  const propsString = propsArray.length ? ' ' + propsArray.join(' ') : ''

  const classNameString = className ? `className={classes.${className}}` : ''

  /** if there are children, explicitly closing tags are needed, self closing oherwise */
  if (childrenJSX && childrenJSX.length > 0) {
    return `<${name} ${classNameString} ${propsString}>\n
      ${childrenJSX}\n
    </${name}>`
  } else {
    return `<${name} ${classNameString} ${propsString}/>`
  }
}

function renderComponentJSX(content: any, target: Target, options: ComponentGeneratorOptions): any {
  const { source, type, ...props } = content

  /** retieve the target type */
  let mapping: any = null
  let mappedType: string = type

  /** if the source is not components, map it with the target's mappers */
  if (source !== 'components') {
    mapping = target.map(source, type)
    if (mapping) mappedType = mapping.type
  }

  /** determine the css class name */
  let className = null

  if (props.style) className = props.style
  delete props.style

  /** there are cases when no children are passed via structure, so the deconstruction will fail */
  let children = null
  if (props.children) children = props.children
  /** need to remove the children from props */
  delete props.children

  /** calculate the children's jsx recursively */
  let childrenJSX: any = []
  if (children && children.length > 0) {
    if (typeof children === 'string') {
      /** if the children it's a string, it can contain a prop mapping */
      if (children.indexOf('$props.') === 0) {
        /** if it does, replace the maing string with the prop's value */
        /** @TODO: might need to move this to libs-js */
        const propKey = children.replace('$props.', '')
        childrenJSX = `{this.props.${propKey}}`
      } else {
        // override Html default behavior regarding left and right trimming
        if (children.indexOf(' ') === 0) children = '&nbsp;' + children

        if (children.substr(children.length - 1) === ' ') children += '&nbsp;'

        /** check for < and > and replace with their html entities otherwise */
        /** @TODO: treat all special characters */
        childrenJSX = children.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }
    } else {
      /** recurse into children to calsulate their JSX */
      childrenJSX = children.map((child) => renderComponentJSX(child, target, options))
    }
  }

  const { name, props: componentProps, ...otherProps } = props // this is to cover img uri props; aka static props

  const mappedProps = { ...componentProps, ...otherProps }

  // @TODO: make sure this is fine to remove
  // if (mapping && typeof mapping.props === 'function') {
  //   mappedProps = mapping.props(mappedProps)
  // }

  /** if there are cbhildren defined in the props, recurse into them */
  if (mappedProps.children && Array.isArray(mappedProps.children)) {
    childrenJSX = mappedProps.children.map((child) => renderComponentJSX(child, target, options))
    delete mappedProps.children
  }

  if (Array.isArray(childrenJSX)) {
    childrenJSX = childrenJSX.join('')
  }

  return renderJsx(mappedType, className, childrenJSX, mappedProps, options)
}

export default class ReactJSSReactComponentCodeGenerator extends ComponentCodeGenerator {
  public render(name: string, content: Content, dependencies: any = {}, styles, props, target: Target, options?: ComponentGeneratorOptions): FileSet | null {
    /** prepare dependencies to be rendered */
    const dependenciesArray = Object.keys(dependencies).map((libraryName) => this.renderDependency(libraryName, dependencies[libraryName], options))

    /** prepare component's render method JSX */
    const jsx = renderComponentJSX(content, target, options)

    /** prepare props deconstruction string */
    let propsString = ''

    /** if no props, initialise with empty array */
    const propsToRender = props || []

    /** and push the default classes prop */
    propsToRender.push('classes')

    /** final props string */
    propsString = `const { ${propsToRender.join(', ')} } = this.props`

    /** styles object string */
    const stylesString = styles ? JSON.stringify(styles, null, 4) : ''

    /** class content */
    const classFileContent = `
      import React, { Component } from 'react'
      import injectSheet from 'react-jss'
      ${dependenciesArray.join(`\n    `)}

      class ${upperFirst(name)} extends Component {
        render () {
          ${propsString}
          return (
            ${jsx}
          )
        }
      }

      const styles = ${stylesString}

      export default injectSheet(styles)(${upperFirst(name)})
    `

    const result = new FileSet()

    result.addFile(`${upperFirst(name)}.js`, classFileContent)

    return result
  }
}
