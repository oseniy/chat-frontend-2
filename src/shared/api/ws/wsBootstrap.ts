import { handleEditChat } from "@/entities/chat/api/ws/editChatHandler";
import {
  handleCreateTextMessage,
  handleDeleteMessage,
  handleReadStatus,
} from "@/features/chat/chat/api/ws/chatHandlers";
import { handleInviteToChat } from "@/features/inviteToChat/api/handleInviteToChat";
import { handleLeaveChat } from "@/features/leaveChat/api/handleLeaveChat";
import { handleRemoveParticipants } from "@/features/removeParticipant/api/handleRemoveParticipants";
import { WS_ACTIONS } from "@/shared/constants/constants";

import { registerWSHandler } from "./wsHandlers";

export const bootstrapWSHandlers = () => {
  registerWSHandler(WS_ACTIONS.CREATE_TEXT_MESSAGE, handleCreateTextMessage);

  registerWSHandler(WS_ACTIONS.CHANGE_STATUS_READ_MESSAGE, handleReadStatus);

  registerWSHandler(WS_ACTIONS.DELETE_MESSAGE, handleDeleteMessage);

  registerWSHandler(WS_ACTIONS.EDIT_CHAT, handleEditChat);

  registerWSHandler(WS_ACTIONS.ADD_MEMBERS_TO_CHAT, handleInviteToChat);

  registerWSHandler(WS_ACTIONS.REMOVE_MEMBERS_FROM_CHAT, handleRemoveParticipants);

  registerWSHandler(WS_ACTIONS.LEAVE_CHAT, handleLeaveChat);
};
