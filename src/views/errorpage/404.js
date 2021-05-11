import React from 'react'
import png404 from '@/assets/images/404.png'
import { Link } from 'react-router-dom'
import { Wrapper404 } from './style'

function Page404(){
  return (
    <Wrapper404>
      <div className="container">
        <img src={png404} />
        <div className="tip">
          <span className="mark">找不到您要访问的页面</span><br/>
          <Link to="/"><span className="home">返回首页</span></Link>
        </div>
      </div>
    </Wrapper404>
  )
}

export default Page404
