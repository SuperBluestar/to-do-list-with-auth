import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type IInput = {
  label: string;
  type: "email" | "password" | "text" | "textarea";
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
  errors: string[];
}

export const LabelInput: FC<IInput> = ({
  label,
  type,
  value,
  onChange,
  errors,
  ...rest
}) => {
  const [id, setId] = useState<string>("");
  useEffect(() => {
    setId(uuidv4());
  }, []);
  return (
    <div className="w-full flex items-start" {...rest}>
      <label className="w-24 grow-0 shrink-0 break-all py-2 px-3" htmlFor={id}>{label}</label>
      <div className="grow shrink flex flex-col gap-1">
        {
          type === "textarea" && <textarea className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id={id} value={value} onChange={(e) => onChange(e.target.value)} />
        }
        {
          type !== "textarea" && <input className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
        }
        { errors.length > 0 && errors.map((error, id) => <span className="text-red-500 text-xs" key={id}>{error}</span>) }
      </div>
    </div>
  )
}
