import { ComponentCodeGenerator, FileSet, Target } from '@teleporthq/teleport-lib-js'
import styleTransformers from '@teleporthq/teleport-lib-js/dist/transformers/styles'
import { Content, ComponentGeneratorOptions } from '@teleporthq/teleport-lib-js/dist/types'
const { jsstocss } = styleTransformers
import upperFirst from 'lodash/upperFirst'
import { PropsUtils, StylesUtils } from './utils'

function renderJsx(name: string, className: string, isRoot?: boolean, childrenJSX?: string, styles?: any, inlineStyle?: any, props?: any): string {
  const propsArray = Object.keys(props).map((propName) => {
    const propValue = PropsUtils.parseForProps(props[propName]) || '""'
    return `${propName}=${propValue}`
  })
  const propsString = propsArray.length ? ' ' + propsArray.join(' ') : ''

  const stylesString = isRoot && Object.keys(styles).length ? `<style jsx>{\`\n    ${jsstocss.stylesheet(styles).css}  \n\`}</style>` : ''
  const classNameString = className ? `className="${className}"` : ''
  const inlineStyleString = inlineStyle ? `style={${inlineStyle}}` : ''

  /** if there are children, explicitly closing tags are needed, self closing oherwise */
  /** if it's the root node, need to render it's style jsx */
  if ((childrenJSX && childrenJSX.length > 0) || isRoot) {
    return `<${name} ${classNameString} ${propsString} ${inlineStyleString}>
      ${childrenJSX}
      ${isRoot ? stylesString : ''}
    </${name}>`
  } else {
    return `<${name} ${classNameString} ${propsString} ${inlineStyleString}/>`
  }
}

function renderComponentJSX(content: any, isRoot: boolean = false, styles: any, inlineStyle: string, target: Target, options: ComponentGeneratorOptions): any {
  const { source, type, ...props } = content

  /** retieve the target type from the lib */
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
      childrenJSX = children.map((child) => renderComponentJSX(child, false, styles, inlineStyle, target, options))
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
    childrenJSX = mappedProps.children.map((child) => renderComponentJSX(child, false, styles, inlineStyle, target, options))
    delete mappedProps.children
  }

  if (Array.isArray(childrenJSX)) {
    childrenJSX = childrenJSX.join('')
  }

  return renderJsx(mappedType, className, isRoot, childrenJSX, styles, inlineStyle, mappedProps)
}

export default class StyledJSXReactComponentCodeGenerator extends ComponentCodeGenerator {
  public render(name: string, content: Content, dependencies: any = {}, styles, props, target: Target, options?: ComponentGeneratorOptions): FileSet | null {
    /** prepare dependencies to be rendered */
    const dependenciesArray = this.getDependenciesString(dependencies, options)

    const { dynamicStyles, staticStyles } = StylesUtils.detectDynamicStyle(styles)
    const { styleName, styleString } = StylesUtils.generateInlineStyleForElement(name, dynamicStyles)

    /** prepare component's render method JSX */
    const jsx = renderComponentJSX(content, true, staticStyles, styleName, target, options)

    /** prepare props string if any */
    const propsString = props && props.length > 0 ? `const { ${props.join(', ')} } = this.props` : ''

    /** class content */
    const classFileContent = `
      import React, { Component } from 'react'
      ${dependenciesArray}

      export default class ${upperFirst(name)} extends Component {
        render () {
          ${propsString}
          ${styleString}
          return (
            ${jsx}
          )
        }
      }
    `

    const result = new FileSet()
    result.addFile(`${upperFirst(name)}.js`, classFileContent)

    return result
  }

  private getDependenciesString(dependencies: any = {}, options?: ComponentGeneratorOptions): string {
    return Object.keys(dependencies)
      .map((libraryName) => this.renderDependency(libraryName, dependencies[libraryName], options))
      .join('\n    ')
  }
}
