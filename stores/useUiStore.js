import create from "zustand"

export const useUiStore = create(set => ({
  // connect modal display
  connectModalOpen: false,
  setConnectModalOpen: () => set(state => ({ connectModalOpen: !state.connectModalOpen })),

  // create thread modal display
  createThreadModalOpen: false,
  setCreateThreadModalOpen: () => set(state => ({ createThreadModalOpen: !state.createThreadModalOpen })),

  // friends modal display
  friendsModalOpen: false,
  setFriendsModalOpen: () => set(state => ({ friendsModalOpen: !state.friendsModalOpen })),

  friendsModalAddress: null,
  setFriendsModalAddress: address => set({ friendsModalAddress: address }),

  // unfriend modal display
  unfriendModalOpen: false,
  setUnfriendModalOpen: unfriendModalOpen => set(state => ({ unfriendModalOpen })),

  unfriendModalFriendStatus: null,
  setUnfriendModalFriendStatus: friendStatus =>
    set(state => ({
      unfriendModalFriendStatus: friendStatus,
      unfriendModalOpen: !state.unfriendModalOpen,
    })),

  // notification count on nav
  notificationCount: null,
  setNotificationCount: count => set({ notificationCount: count }),

  // mobile notification modal display
  mobileNotificationsOpen: false,
  setMobileNotificationsOpen: isOpen =>
    set({
      mobileNotificationsOpen: isOpen,
    }),

  // message count on nav
  messagesCount: null,
  setMessagesCount: count => set({ messagesCount: count }),
}))
