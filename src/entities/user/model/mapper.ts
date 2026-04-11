import { ChatMember, ChatMemberDto, User, UserDto, UserPreview, UserPreviewDto } from "./types";

/**
 * Базовый маппер для UserPreview
 */
export const mapUserPreviewDto = (dto: UserPreviewDto): UserPreview => ({
  uid: dto.uid,
  username: dto.username,
  nickname: dto.nickname,
  firstName: dto.first_name,
  lastName: dto.last_name || "",
  fullName: `${dto.first_name} ${dto.last_name}`.trim() || dto.username,
  avatarUrl: dto.avatar_url || dto.avatar_webp_url || "",
  wasOnlineAt: dto.was_online_at || null,
  isOnline: dto.is_online || null,
  patronymic: dto.patronymic || "",
  avatarWebpUrl: dto.avatar_webp_url || "",
});

/**
 * Маппер для ChatMember (участник чата/контакт)
 */
export const mapChatMemberDto = (dto: ChatMemberDto): ChatMember => {
  const base = mapUserPreviewDto(dto);

  return {
    ...base,
    avatarExtra: dto.avatar || null,
    avatarWebpExtra: dto.avatar_webp || null,
    isBlocked: dto.is_blocked,
    isOnline: dto.is_online,
    lastSeenAt: dto.was_online_at,
    isInContacts: dto.is_in_contacts,
    chatId: dto.chat_id || null,
    birthday: dto.birthday || null,
    phone: dto.phone || "",
    bio: dto.additional_information || "",
  };
};

/**
 * Маппер для полного профиля User
 */
export const mapUserDto = (dto: UserDto): User => {
  const base = mapUserPreviewDto(dto);

  return {
    ...base,
    avatar: dto.avatar || "",
    avatarUrl: dto.avatar_url || "",
    avatarWebp: dto.avatar_webp || "",
    bio: dto.additional_information || "",
    birthday: dto.birthday ?? null,
    email: dto.email || "",
    gender: dto.gender ?? "male",
    genderLabel: dto.gender_label || "",
    country: dto.country || "",
    countryLabel: dto.country_label || "",
    cityId: dto.city_id ?? null,
    city: dto.city || "",
    phone: dto.phone || "",
    isDoctor: dto.is_doctor ?? false,
    isConfirmedDoctor: dto.is_confirmed_doctor ?? false,
    isFilled: dto.is_filled ?? false,
    isStaff: dto.is_staff ?? false,
    // Поля из ChatMember, которые тоже есть в этом DTO
    isBlocked: dto.is_blocked ?? false,
    isOnline: dto.is_online ?? false,
    lastSeenAt: dto.was_online_at ?? null,
  };
};
