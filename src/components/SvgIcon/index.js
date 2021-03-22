import React from 'react'
import { SvgWrapper } from './style'

function SvgIcon(props){
  const { iconClass, className } = props
  const iconName = `#icon-${iconClass}`

  let svgClass
  if(className){
    svgClass = 'svg-icon ' + className
  }else{
    svgClass = 'svg-icon'
  }

  return (
    <SvgWrapper {...props} className={svgClass} aria-hidden="true">
      <use href={iconName}></use>
    </SvgWrapper>
  )
}

export default SvgIcon
