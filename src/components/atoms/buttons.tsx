import { FC } from "react"

export type IButton = React.DetailedHTMLProps<React.HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  disabled?: boolean;
}

export const Button: FC<IButton> = (props) => {
  return (
    <button {...props} className={`${props.disabled ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded-full ${props.className}`} disabled={props.disabled}></button>
  )
}
