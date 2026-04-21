export const MESSAGE_STATUS = {
  PENDING: "pending",
  DELIVERED: "delivered",
  FAILED: "failed",
  READ: "read",
} as const;

export const WS_ACTIONS = {
  CONNECT: "_connect",

  CREATE_CHAT: "create_chat",
  EDIT_CHAT: "edit_chat",
  DELETE_CHAT: "delete_chat",

  ADD_MEMBERS_TO_CHAT: "add_members_to_chat",
  REMOVE_MEMBERS_FROM_CHAT: "remove_members_from_chat",
  TRANSFER_OWNER: "transfer_owner",
  OWNER_TRANSFERRED: "owner_transferred",
  MEMBER_ADDED: "member_added",
  SELF_JOIN_CHAT: "self_join_chat",
  LEAVE_CHAT: "leave_chat",

  GET_STATUS_LIST_CHAT: "get_status_list_chat",

  CREATE_TEXT_MESSAGE: "create_text_message",
  UPDATE_MESSAGE: "update_message",
  DELETE_MESSAGE: "delete_message",
  CHANGE_STATUS_READ_MESSAGE: "change_status_read_message",

  CLEAR_GROUP_MESSAGES: "clear_group_messages",

  NEW_STATUS_USER: "new_status_user",
} as const;
