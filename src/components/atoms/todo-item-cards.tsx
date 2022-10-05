import { TodoItem } from "@prisma/client";
import { FC } from "react"
import { Button } from "./buttons";
import moment from "moment";

export type ITodoItemCard = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & TodoItem & {
  selected?: boolean;
  onClickCheck?: () => void;
  onClickEdit?: () => void;
  onClickMark?: () => void;
  onClickRemove?: () => void;
}

export const TodoItemCard: FC<ITodoItemCard> = (props) => {
  return (
    <div className="w-full rounded-2xl pl-24 pr-8 py-2 flex flex-col gap-4 border shadow-lg relative">
      <div className="absolute left-12 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <input type="checkbox" onChange={props.onClickCheck} checked={props.selected} />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h4 className="text-2xl">{props.title}</h4>
          { !props.marked && <span className="bg-green-500 text-sm rounded px-1">Todo</span>}
          { props.marked && <span className="bg-green-500 text-sm rounded px-1">Completed</span>}
        </div>
        <div>
          <span className="text-sm">Last updated at {moment(props.createdAt).format("HH:mm:ss MMM DD, YYYY")}</span>
        </div>
      </div>
      <span className="text-sm">Created at {moment(props.createdAt).format("HH:mm MMM DD, YYYY")}</span>
      <p className="text-lg w-full break-all">{props.content}</p>
      <div className="flex justify-end items-center gap-4">
        <Button onClick={props.onClickEdit}>Edit</Button>
        <Button onClick={props.onClickMark}>{props.marked ? "Unmark" : "Mark"}</Button>
        <Button onClick={props.onClickRemove}>Remove</Button>
      </div>
    </div>
  )
}
