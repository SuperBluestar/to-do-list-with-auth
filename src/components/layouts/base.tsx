import { FC } from 'react'
import Header from './header'

const Base: FC<{ children: JSX.Element }> = (props) => {
  return (
    <>
      <Header></Header>
      <main id="page-content" className="flex flex-col bg-black-main" style={{ minHeight: 'calc(100vh - 7rem)' }}>{props.children}</main>
    </>
  )
}

export default Base
