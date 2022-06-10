import React from "react"
import NotificationCard from "./NotificationCard"

const NotificationsDropdown = ({ ...props }) => {
  const { data, notificationCount, notificationsOpen } = props
  console.log('notifications dropdown data', data)

  const notifications = React.useMemo(() => {
    if (!data) {
      return []
    }

    return [
      // ...data?.parsedNotifs.FRIEND_REQUESTS,
      ...data?.parsedNotifs.FRIEND_REQUESTS_ACCEPTED,
      ...data?.parsedNotifs.PROPOSAL_REQUEST,
      ...data?.parsedNotifs.PROPOSAL_RESULT,
      ...data?.parsedNotifs.TRANSACTION_EXECUTION,
      ...data?.parsedNotifs.DAO_INVITE,
    ]
  }, [data])

  const notificationsList = React.useMemo(() => {
    return !notifications.length ? (
      <li>
        <p className="text-center">¯\_(ツ)_/¯</p>
        <p className="text-center">No notifications</p>
      </li>
    ) : (
      <>
        {notifications.map(notif => (
          <NotificationCard
            key={notif.id}
            id={notif.id}
            relationshipRef={notif.ref}
            body={notif.body}
            seen={notif.seen}
            notificationsOpen={notificationsOpen}
          />
        ))}
      </>
    )
  }, [notifications])

  return (
    <div
      className={
        (notificationsOpen ? "absolute " : "hidden ") +
        "top-0 right-0 z-50 h-72 w-1/4 -translate-x-32 translate-y-16 mt-3 overflow-auto rounded-xl border bg-slate-200 px-4 py-2 text-slate-800 shadow dark:bg-slate-900 dark:text-white"
      }
    >
      <div className="mb-2 flex flex-row justify-between rounded border p-2">
        <h1>Notifications</h1>
      </div>
      <ul>{notificationsList}</ul>
    </div>
  )
}

export default NotificationsDropdown
