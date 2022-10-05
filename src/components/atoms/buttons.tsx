import { FC } from "react"

export type IButton = React.DetailedHTMLProps<React.HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {}

export const Button: FC<IButton> = (props) => {
  return (
    <button {...props} className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full ${props.className}`}></button>
  )
}
