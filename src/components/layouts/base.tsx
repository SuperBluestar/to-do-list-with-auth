import { FC } from 'react'
import Header from './header'

const Base: FC<{ children: JSX.Element }> = (props) => {
  return (
    <>
      <Header></Header>
      <main id="page-content" className="w-full bg-black-main">{props.children}</main>
    </>
  )
}

export default Base
