//import "emoji-mart/css/emoji-mart.css"
// import "styles/emoji-mart.css"
import React from "react"
import { Picker } from "emoji-mart"
import useForm from "hooks/useForm"
import { useTheme } from "next-themes"
import ClickAwayListener from "react-click-away-listener"
import { HiOutlineEmojiHappy } from "react-icons/hi"
import { useMutation, useQueryClient } from "react-query"
import { useMessageStore } from "stores/useMessageStore"
import { useAccount } from "wagmi"
import * as api from "query"

const DesktopMessageInput = () => {
  const { state, setState, handleChange } = useForm()
  const queryClient = useQueryClient()
  const { threadChannel } = useMessageStore()

  const {
    data,
    error,
    mutateAsync: createMessage,
  } = useMutation(api.createMessage, {
    onSettled: async () => {
      await queryClient.invalidateQueries(["thread messages", threadChannel], {
        refetchActive: true,
      })
    },
  })

  const { data: accountData, error: accountError, loading: accountLoading } = useAccount()

  const handleSubmit = e => {
    e.preventDefault()
    if (!accountData) {
      console.log("MessageForm.js no account data")
      return
    }
    const req = {
      sender: accountData.address,
      channel: threadChannel,
      body: state.message,
    }
    createMessage(req)
    setState({})
  }

  const [isEmojiPickerOpen, setEmojiPickerOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()

  const showEmojiPicker = React.useCallback(() => {
    if (!isEmojiPickerOpen) {
      setEmojiPickerOpen(true)
    }
  }, [isEmojiPickerOpen])

  const hideEmojiPicker = React.useCallback(() => {
    if (isEmojiPickerOpen) {
      setEmojiPickerOpen(false)
    }
  }, [isEmojiPickerOpen])

  const ref = React.useRef(null)
  const handleEmojiClick = e => {
    const cursor = ref.current.selectionStart
    if (cursor === 0 || !state.message) {
      setState({
        message: e.native,
      })
      const newCursor = cursor + e.native.length
      setTimeout(() => ref.current.setSelectionRange(newCursor, newCursor), 10)
    } else {
      const text =
        state.message.slice(0, cursor) + e.native + state.message.slice(cursor)
      setState({ message: text })
      const newCursor = cursor + e.native.length
      setTimeout(() => ref.current.setSelectionRange(newCursor, newCursor), 10)
    }
  }

  const emojiPicker = React.useMemo(() => {
    return isEmojiPickerOpen ? (
      <ClickAwayListener onClickAway={hideEmojiPicker}>
        <div className="absolute -top-20 left-0 z-50 -translate-y-96 -translate-x-48">
          <Picker
            onSelect={handleEmojiClick}
            theme={theme === "dark" ? "dark" : "light"}
            emoji="desert_island"
            title=""
            native={true}
          />
        </div>
      </ClickAwayListener>
    ) : null
  }, [isEmojiPickerOpen, theme, handleEmojiClick, hideEmojiPicker])

  return (
    <form
      className="flex h-[15%] w-full flex-row items-center py-3 md:h-[10%]"
      onSubmit={handleSubmit}
    >
      <textarea
        autoFocus
        className="h-full w-[90%] resize-none rounded-xl bg-slate-100 p-3 text-white focus:text-slate-900 focus:outline-none dark:bg-slate-700 dark:focus:text-slate-100"
        type="textarea"
        name="message"
        placeholder="Message..."
        autoComplete="off"
        value={state.message || ""}
        onChange={handleChange}
        required
        ref={ref}
      />
      <div className="relative flex">
        {emojiPicker}

        <button
          className="ml-3 flex items-center rounded-full border bg-slate-200 p-3 font-bold shadow-xl hover:bg-slate-100 focus:outline-none dark:bg-slate-700 dark:hover:bg-slate-600"
          type="button"
          onClick={showEmojiPicker}
        >
          <HiOutlineEmojiHappy size={24} />
        </button>
      </div>
      <button
        className="mx-3 flex items-center rounded-xl border bg-slate-200 p-3 font-bold shadow-xl hover:bg-slate-100 focus:outline-none dark:bg-slate-700 dark:hover:bg-slate-600"
        type="submit"
      >
        send
      </button>
    </form>
  )
}

export default DesktopMessageInput
