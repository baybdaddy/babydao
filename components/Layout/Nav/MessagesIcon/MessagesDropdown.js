import React from "react"
import MessageCard from "./MessageCard"

const MessagesDropdown = ({ ...props }) => {
  const { messagesOpen } = props

  return (
    <div
      className={
        (messagesOpen ? "absolute " : "hidden ") +
        "top-0 right-0 z-50 h-2/3 w-4/12 -translate-x-20 translate-y-20 overflow-auto rounded border bg-slate-200 px-4 py-2 text-slate-800 shadow dark:bg-slate-900 dark:text-white"
      }
    >
      <div className="mb-2 flex flex-row justify-between rounded border p-2">
        <h1>Messages</h1>
      </div>
      <ul className="">
        <MessageCard />
        <MessageCard />
      </ul>
    </div>
  )
}

export default MessagesDropdown
