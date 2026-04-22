import { handleEditChat } from "@/entities/chat/api/ws/editChatHandler";
import { handleNewStatusUser } from "@/entities/user/api/ws/newStatusUserHandler";
import {
  onAnswer,
  onCompletion,
  onIce,
  onOffer,
  onStateUpdate,
} from "@/features/call/api/callWsHandlers";
import { CALL_WS_ACTIONS } from "@/features/call/lib/constants";
import {
  handleCreateTextMessage,
  handleDeleteMessage,
  handleReadStatus,
} from "@/features/chat/chat/api/ws/chatHandlers";
import { handleClearGroupMessages } from "@/features/clearChat/api/handleClearGroupMessages";
import { handleCreateChat } from "@/features/createChat/api/handleCreateChat";
import { handleDeleteChat } from "@/features/deleteChatGlobal/api/handleDeleteChat";
import { handleInviteToChat } from "@/features/inviteToChat/api/handleInviteToChat";
import { handleJoinedToChat } from "@/features/joinToChat/api/handleJoinedToChat";
import { handleLeaveChat } from "@/features/leaveChat/api/handleLeaveChat";
import { handleOwnerTransferred } from "@/features/makeAdmin/api/handleOwnerTransferred";
import { handleRemoveParticipants } from "@/features/removeParticipant/api/handleRemoveParticipants";
import { WS_ACTIONS } from "@/shared/constants/constants";

import { WSHandler } from "./model/types";
import { registerWSHandler } from "./wsHandlers";

export const bootstrapWSHandlers = () => {
  registerWSHandler(WS_ACTIONS.CREATE_TEXT_MESSAGE, handleCreateTextMessage);

  registerWSHandler(WS_ACTIONS.CHANGE_STATUS_READ_MESSAGE, handleReadStatus);

  registerWSHandler(WS_ACTIONS.DELETE_MESSAGE, handleDeleteMessage);

  registerWSHandler(WS_ACTIONS.EDIT_CHAT, handleEditChat);

  registerWSHandler(WS_ACTIONS.ADD_MEMBERS_TO_CHAT, handleInviteToChat);

  registerWSHandler(WS_ACTIONS.MEMBER_ADDED, handleJoinedToChat);

  registerWSHandler(WS_ACTIONS.REMOVE_MEMBERS_FROM_CHAT, handleRemoveParticipants);

  registerWSHandler(WS_ACTIONS.LEAVE_CHAT, handleLeaveChat);

  registerWSHandler(WS_ACTIONS.CREATE_CHAT, handleCreateChat);

  registerWSHandler(WS_ACTIONS.DELETE_CHAT, handleDeleteChat);

  registerWSHandler(WS_ACTIONS.OWNER_TRANSFERRED, handleOwnerTransferred);

  registerWSHandler(WS_ACTIONS.CLEAR_GROUP_MESSAGES, handleClearGroupMessages);

  registerWSHandler(WS_ACTIONS.NEW_STATUS_USER, handleNewStatusUser);

  registerWSHandler(CALL_WS_ACTIONS.OFFER, onOffer as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.ICE, onIce as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.ANSWER, onAnswer as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.COMPLETION, onCompletion as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.STATE_UPDATE, onStateUpdate as WSHandler);

  // bootstrapCallWSHandlers();
};
