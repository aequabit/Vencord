/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { MessageDecorations } from "@api/index";
import { showNotification } from "@api/Notifications";
import { definePluginSettings, Settings } from "@api/Settings";
import { classNameFactory } from "@api/Styles";
import { Grid } from "@components/Grid";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, ModalSize, openModalLazy } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { findByCodeLazy, findByPropsLazy, findComponentByCodeLazy, findLazy, findStoreLazy } from "@webpack";
import { Button, ChannelStore, Clickable, Clipboard, ContextMenuApi, Forms, Menu, MessageActions, MessageCache, MessageStore, RestAPI, ScrollerThin, SelectedChannelStore, SnowflakeUtils, Text, TextInput, Timestamp, Toasts, UserStore } from "@webpack/common";
import { Channel, Message, User } from "discord-types/general";
import messageDecorations from "plugins/_api/messageDecorations";
import { PropsWithChildren } from "react";

type IconProps = JSX.IntrinsicElements["svg"];
interface BaseIconProps extends IconProps {
    viewBox: string;
}
function Icon({ height = 24, width = 24, className, children, viewBox, ...svgProps }: PropsWithChildren<BaseIconProps>) {
    return (
        <svg
            className={classes(className, "vc-icon")}
            role="img"
            width={width}
            height={height}
            viewBox={viewBox}
            {...svgProps}
        >
            {children}
        </svg>
    );
}

function UserWaveIcon({ height = 24, width = 24, className }: IconProps) {
    return (
        <Icon
            height={height}
            width={width}
            className={classes(className, "vc-user-wave-icon")}
            viewBox="0 0 24 24"
        >
            <g fill="none" fill-rule="evenodd">
                <path fill="white" d="M13 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path><path fill="white" d="M3 5v-.75C3 3.56 3.56 3 4.25 3s1.24.56 1.33 1.25C6.12 8.65 9.46 12 13 12h1a8 8 0 0 1 8 8 2 2 0 0 1-2 2 .21.21 0 0 1-.2-.15 7.65 7.65 0 0 0-1.32-2.3c-.15-.2-.42-.06-.39.17l.25 2c.02.15-.1.28-.25.28H9a2 2 0 0 1-2-2v-2.22c0-1.57-.67-3.05-1.53-4.37A15.85 15.85 0 0 1 3 5Z"></path>
            </g>
        </Icon>
    );
}

function CallHangupIcon({ height = 24, width = 24, className }: IconProps) {
    return (
        <Icon
            height={height}
            width={width}
            className={classes(className, "vc-user-wave-icon")}
            viewBox="0 0 24 24"
        >
            <g fill="none" fill-rule="evenodd">
                <defs><clipPath id="__lottie_element_151"><rect width={width} height={height} x="0" y="0"></rect></clipPath><clipPath id="__lottie_element_153"><path d="M0,0 L600,0 L600,600 L0,600z"></path></clipPath></defs><g clip-path="url(#__lottie_element_151)"><g clip-path="url(#__lottie_element_153)" transform="matrix(0.03999999910593033,0,0,0.03999999910593033,0,0)" opacity="1" style={{ display: "block" }}><g transform="matrix(25,0,0,25,300,315)" opacity="1" style={{ display: "block" }}><g opacity="1" transform="matrix(1,0,0,1,0,-0.6100000143051147)"><path fill="white" fill-opacity="1" d=" M9.335000038146973,-1.8179999589920044 C4.184999942779541,-6.9670000076293945 -4.164000034332275,-6.9670000076293945 -9.312999725341797,-1.8179999589920044 C-11.690999984741211,0.5609999895095825 -11.35099983215332,3.6040000915527344 -9.555999755859375,5.39900016784668 C-9.300999641418457,5.6539998054504395 -8.909000396728516,5.7129998207092285 -8.59000015258789,5.544000148773193 C-8.59000015258789,5.544000148773193 -4.269999980926514,3.256999969482422 -4.269999980926514,3.256999969482422 C-3.871000051498413,3.0460000038146973 -3.683000087738037,2.5769999027252197 -3.8259999752044678,2.1489999294281006 C-3.8259999752044678,2.1489999294281006 -4.558000087738037,-0.04600000008940697 -4.558000087738037,-0.04600000008940697 C-1.8250000476837158,-1.9980000257492065 1.8459999561309814,-1.9980000257492065 4.578999996185303,-0.04600000008940697 C4.578999996185303,-0.04600000008940697 3.815000057220459,2.757999897003174 3.815000057220459,2.757999897003174 C3.693000078201294,3.2070000171661377 3.9240000247955322,3.677000045776367 4.354000091552734,3.8540000915527344 C4.354000091552734,3.8540000915527344 8.63599967956543,5.617000102996826 8.63599967956543,5.617000102996826 C8.946000099182129,5.744999885559082 9.303000450134277,5.672999858856201 9.539999961853027,5.435999870300293 C11.331999778747559,3.6440000534057617 11.708999633789062,0.5559999942779541 9.335000038146973,-1.8179999589920044z"></path></g></g></g></g>
            </g>
        </Icon >
    );
}

function CheckmarkIcon({ height = 24, width = 24, className }: IconProps) {
    return (
        <Icon
            height={height}
            width={width}
            className={classes(className, "vc-checkmark-icon")}
            viewBox="0 0 24 24"
        >
            <g fill="none" fill-rule="evenodd">
                <path fill="var(--white-500)" fill-rule="evenodd" d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm5.7-13.3a1 1 0 0 0-1.4-1.4L10 14.58l-2.3-2.3a1 1 0 0 0-1.4 1.42l3 3a1 1 0 0 0 1.4 0l7-7Z" clip-rule="evenodd" ></path>
            </g>
        </Icon>
    );
}

function EmptyIcon({ height = 24, width = 24, className }: IconProps) {
    return (
        <Icon
            height={height}
            width={width}
            className={classes(className, "vc-link-icon")}
            viewBox="0 0 24 24"
        >
        </Icon>
    );
}

interface UserContextProps {
    channel: Channel;
    guildId?: string;
    user: User;
}

interface ChannelContextProps {
    channel: Channel;
}

const ChannelTypes = findLazy(m => m.ANNOUNCEMENT_THREAD === 10);
const VoiceStateStore = findStoreLazy("VoiceStateStore");
const cl = classNameFactory("vc-pindms-modal-");

interface VoiceState {
    userId: string;
    channelId?: string;
    oldChannelId?: string;
    deaf: boolean;
    mute: boolean;
    selfDeaf: boolean;
    selfMute: boolean;
}

function sendMessage(channelId: string, content: string, messageReference?: string) {
    RestAPI.post({
        url: `/channels/${channelId}/messages`,
        body: {
            channel_id: channelId,
            content: content,
            nonce: SnowflakeUtils.fromTimestamp(Date.now()),
            sticker_ids: [],
            type: 0,
            attachments: [],
            message_reference: messageReference ? { message_id: messageReference } : null,
        }
    });
}

function _sendMessage(channelId: string, content: string, messageReference?: string) {
    const msg = {
        content,
        tts: false,
        invalidEmojis: [],
        validNonShortcutEmojis: []
    };

    MessageActions._sendMessage(channelId, msg);
}

const zentrumBotId = "1110336525176164452";

function getChannelMessages(channelId: string) {
    const channelMessages = MessageStore.getMessages(channelId);
    console.log("CHANNEL MESSAGES: ", channelMessages);
    if (!channelMessages || !channelMessages.toArray) return;
    console.log("CHECK:", channelMessages, channelMessages.toArray !== undefined);

    for (const message of channelMessages.toArray()) {
        if (!message.author || !message.author.id) continue;

        // TODO: Don't do this
        if (message.author.id !== zentrumBotId) return;

        console.log("BOT MESSAGE:", message);

        // @Gesocksbeseitigungsminister, du hast @Miri Egirl aus dem temporären Sprachkanal gekickt.
        // if (!message.)
    }

    // console.log(MessageCache._channelMessages);
}

let _notifyAbort = false;
export function notify(text: string, icon?: string, onClick?: () => void) {
    // Trash
    if (_notifyAbort) return;
    _notifyAbort = true;
    setTimeout(() => _notifyAbort = false, 2500);

    showNotification({
        title: "VoiceCommands",
        body: text,
        icon,
        onClick
    });
}

function getBlockedUsers(): string[] {
    const blockedUserIDs = Settings.plugins.VoiceCommands?.blockedUserIDs || "";

    // Hope this helps
    return blockedUserIDs
        .trim()
        .split(",")
        .map(x => x.trim())
        .filter(x => x.length > 0);
}

function blockUser(userId: string) {
    const blockedUsers = getBlockedUsers();
    if (blockedUsers.includes(userId)) return; // Already blocked
    blockedUsers.push(userId);
    Settings.plugins.VoiceCommands.blockedUserIDs = blockedUsers.join(",");
}

function unblockUser(userId: string) {
    const blockedUsers = getBlockedUsers();
    const blockedUserIndex = blockedUsers.indexOf(userId);
    if (blockedUserIndex === -1) return; // User not blocked
    blockedUsers.splice(blockedUserIndex, 1);
    Settings.plugins.VoiceCommands.blockedUserIDs = blockedUsers.join(",");
}

type UserModerationPermission = "kick" | "ban" | "limit" | "lock" | "rename" | "immunity";
interface UserAttributeList { [key: string]: UserModerationPermission[]; }
function getModeratorUsers(): UserAttributeList {
    const moderatorUserConfig = Settings.plugins.VoiceCommands?.moderatorUserConfig || "";
    if (moderatorUserConfig === "") {
        Settings.plugins.VoiceCommands.moderatorUserConfig = "{}";
        notify("The moderator permission configuration has been reset.");
    }

    try {
        return JSON.parse(Settings.plugins.VoiceCommands?.moderatorUserConfig);
    } catch (err) {
        notify("Failed to parse moderator permissions: " + (err as Error).message);
        return {};
    }
}

const setModeratorUsers = (moderatorUserConfig: UserAttributeList) => Settings.plugins.VoiceCommands.moderatorUserConfig = JSON.stringify(moderatorUserConfig);

const userIsModerator = (userId: string) => getModeratorUsers()[userId] !== undefined;

function userHasPermission(userId: string, permission: UserModerationPermission) {
    const moderatorUsers = getModeratorUsers();
    const userPermissions = moderatorUsers[userId];
    return userPermissions && userPermissions.includes(permission);
}

function userAddPermission(userId: string, permission: UserModerationPermission) {
    const moderatorUsers = getModeratorUsers();
    if (!moderatorUsers[userId]) moderatorUsers[userId] = [];
    moderatorUsers[userId].push(permission);
    setModeratorUsers(moderatorUsers);
}

function userRemovePermission(userId: string, permission: UserModerationPermission) {
    const moderatorUsers = getModeratorUsers();
    if (!moderatorUsers[userId]) return;
    moderatorUsers[userId] = moderatorUsers[userId].filter(x => x !== permission);
    if (moderatorUsers[userId].length === 0) delete moderatorUsers[userId]; // Clear the entire object if no permissions remain
    setModeratorUsers(moderatorUsers);
}

function userTogglePermission(userId: string, permission: UserModerationPermission) {
    const moderatorUsers = getModeratorUsers();
    if (!userHasPermission(userId, permission))
        userAddPermission(userId, permission);
    else
        userRemovePermission(userId, permission);
}

const channelOwners = new Map<string, string>();

function isChannelOwner(channelId: string, userId: string): boolean {
    if (!channelOwners.has(channelId)) return false; // No owner set for channel
    if (channelOwners.get(channelId) !== userId) return false; // User is not the owner
    return true;
}

function setChannelOwner(channelId: string, userId: string) {
    channelOwners[channelId] = userId;
}

function determineChannelOwner(channelId: string): string | null {
    const channel = ChannelStore.getChannel(channelId);
    if (!channel) return null;

    const channelMessages = MessageStore.getMessages(channelId);
    if (!channelMessages) return null;

    // console.log("CHANNEL MESSAGES:", channelMessages);

    return "";
}

type VoiceChannelEvent = { type: "join" | "leave"; at: number; userId: string; };
type VoiceChannelEventLog = { [channelId: string]: VoiceChannelEvent[]; };
let voiceChannelEvents: VoiceChannelEventLog = {};

type UserVoiceStateLog = { [userId: string]: (string | undefined)[]; };
let userVoiceStateLog: UserVoiceStateLog = {};

let startTime: number | undefined = undefined;

const onVoiceStateUpdates = ({ voiceStates }: { voiceStates: VoiceState[]; }) => {
    const me = UserStore.getCurrentUser();

    // Event logging
    for (const state of voiceStates) {
        const { userId, channelId, oldChannelId } = state;

        // TÖRÖÖÖÖÖÖÖÖ
        // if (userId !== "1157043198833733692") continue;

        // Log user channel join
        if (!userVoiceStateLog[userId]) userVoiceStateLog[userId] = [];
        userVoiceStateLog[userId].push(channelId);

        const voiceStateLog = userVoiceStateLog[userId];

        // For some reason oldChannelId is always the same as channelId when switching from one channel to another
        let realOldChannelId: string | undefined = undefined;
        if (voiceStateLog.length > 1) {
            realOldChannelId = voiceStateLog[voiceStateLog.length - 2];
        }

        const _user = UserStore.getUser(userId).username;
        const _channel = channelId ? ChannelStore.getChannel(channelId).name : "<null>";
        const _oldChannel = realOldChannelId ? ChannelStore.getChannel(realOldChannelId).name : "<null>";
        // console.log(`USER=${_user} CHANNEL=${_channel} OLDCHANNEL=${_oldChannel}`);

        if (realOldChannelId !== undefined) {
            if (!voiceChannelEvents[realOldChannelId])
                voiceChannelEvents[realOldChannelId] = [];

            voiceChannelEvents[realOldChannelId].push({ type: "leave", at: Date.now(), userId });
        }

        if (channelId !== undefined) {
            if (!voiceChannelEvents[channelId])
                voiceChannelEvents[channelId] = [];

            voiceChannelEvents[channelId].push({ type: "join", at: Date.now(), userId });
        }
    }


    // Get our current voice state of the selected user
    const userVoiceState = VoiceStateStore.getVoiceStateForUser(me.id);
    if (!userVoiceState) return;

    const voiceChannelId = userVoiceState.channelId;

    // Get voice channel
    const channel = ChannelStore.getChannel(voiceChannelId);
    if (!channel) return;

    if (channel.type === 13) return; // Ignore Stage Channels

    //determineChannelOwner(channel.id);

    // Blocklist check
    for (const state of voiceStates) {
        const { userId, channelId, oldChannelId } = state;

        const userInChannel = channelId !== undefined;
        const userOldChannel = channelId !== undefined;

        if (channelId !== voiceChannelId) continue; // User is not in our channel

        // It's us
        if (userId === me.id) {
            if (!oldChannelId) continue;
            const oldChannel = ChannelStore.getChannel(oldChannelId);
            if (!oldChannel) continue;
            // TODO: Don't hardcode this
            const oldChannelIsLobby = oldChannel.name.includes("Voice erstellen") || oldChannel.name.includes("Kanal erstellen");
            if (!oldChannelIsLobby) continue;
            type UserEx = User & { globalName: string; };
            if (channel.name === `${(me as UserEx).globalName}'s Channel` ||
                channel.name === `${(me as UserEx).globalName}s Kanal` ||
                channel.name === `${me.username}'s Channel` ||
                channel.name === `${me.username}s Kanal`
            ) {
                setChannelOwner(channel.id, me.id);

                console.log("CHANNEL CREATED: " + channel.name);
            }
        }

        // User is blocked
        if (getBlockedUsers().includes(userId)) {
            sendMessage(voiceChannelId, `!voice-ban <@${userId}>`);
        }
    }
};

const onMessageCreate = ({ message, optimistic }: { message: Message; optimistic: boolean; }) => {
    //if (optimistic) return;
    const channel = ChannelStore.getChannel(message.channel_id);

    const me = UserStore.getCurrentUser();

    // Get our current voice state of the selected user
    const userVoiceState = VoiceStateStore.getVoiceStateForUser(me.id);
    if (!userVoiceState) return;

    if (channel.type !== 2) return; // Not a voice channel

    if (channel.id !== userVoiceState.channelId) return; // Not our voice channel

    if (message.content.startsWith(".msg")) {
        getChannelMessages(channel.id);
        return;
    }

    if (message.author.id === me.id) return; // Message was sent by us

    const userModeratorPermissions = getModeratorUsers()[message.author.id];

    if (message.content.startsWith(".permissions")) {
        if (!userModeratorPermissions)
            sendMessage(channel.id, "You are not a moderator", message.id);
        else
            sendMessage(channel.id, `Your permissions: ${userModeratorPermissions.join(", ")}`, message.id);

        return;
    }

    if (!userModeratorPermissions) return; // Sender is not a moderator

    const messageParts = message.content
        .substring(1) // Remove prefix (! / .)
        .replace("voice-", "")
        .split(" "); // Split at space, i.e. "ban @<1234567890>" -> [voice-ban, @<1234567890>]

    if (messageParts.length < 1 || messageParts.length > 2) return; // Message has too few or too many parts

    const command = messageParts[0];
    let permissionName = command;
    if (command === "unban") permissionName = "ban"; // Shitty hack
    if (command === "unlock") permissionName = "lock"; // Shitty hack
    if (!userModeratorPermissions.includes(permissionName as UserModerationPermission)) return; // No permissions for command

    if (["ban", "unban", "kick", "limit", "rename"].includes(command))
        if (messageParts.length < 2) return; // Command argument missing

    const commandArg = messageParts[1];

    // User tag is invalid
    if (["ban", "unban", "kick"].includes(command)) {
        const userId = commandArg.replace(">", "").replace("<@", "");
        if (userId === commandArg) return; // No tags were present in the first place
        if (isNaN(parseInt(userId))) return; // User ID is not a valid number

        // Target is another moderator
        if (command !== "unban" && Settings.plugins.VoiceCommands.voiceModeratorImmunity && userIsModerator(userId)) {
            sendMessage(channel.id, "Cannot kick or ban other moderators", message.id);
            return;
        }
    }

    // Limit argument is not a valid number
    if (command === "limit" && isNaN(parseInt(commandArg))) return;

    // Channel name argument is too short or too long
    if (command === "rename" && commandArg.length < 1 || commandArg.length > 99) return;

    sendMessage(channel.id, message.content);
};

const UserContextMenuPatch: NavContextMenuPatchCallback = (children, { user }: UserContextProps) => {
    if (!user || user.id === UserStore.getCurrentUser().id) return;

    // Get our current voice channel
    const voiceChannelId = SelectedChannelStore.getVoiceChannelId();
    const amInVoice = !!voiceChannelId;

    // Get voice state of the selected user
    const userVoiceState = VoiceStateStore.getVoiceStateForUser(user.id);
    const userInVoice = !!userVoiceState;
    const userInMyVoice = userInVoice && userVoiceState.channelId === voiceChannelId;

    if (amInVoice && userInMyVoice && settings.store.voiceKick)
        children.push(
            <Menu.MenuItem
                id="vc-kick-user"
                label="Kick user"
                action={() => sendMessage(voiceChannelId, `!voice-kick <@${user.id}>`)}
            />
        );

    if (amInVoice && userInMyVoice && settings.store.voiceBan)
        children.push(
            <Menu.MenuItem
                id="vc-ban-user"
                label="Ban user"
                action={() => sendMessage(voiceChannelId, `!voice-ban <@${user.id}>`)}
            />
        );

    if (amInVoice && settings.store.voiceUnban)
        children.push(
            <Menu.MenuItem
                id="vc-unban-user"
                label="Unban user"
                action={() => sendMessage(voiceChannelId, `!voice-unban <@${user.id}>`)}
            />
        );

    if (settings.store.voiceBlock)
        children.push(
            <Menu.MenuItem
                id="vc-block-user"
                label="Block user"
                action={() => blockUser(user.id)}
            />
        );

    if (settings.store.voiceUnblock)
        children.push(
            <Menu.MenuItem
                id="vc-unblock-user"
                label="Unblock user"
                action={() => unblockUser(user.id)}
            />
        );

    if (amInVoice && userInMyVoice && settings.store.voiceTransfer)
        children.push(
            <Menu.MenuItem
                id="vc-transfer"
                label="Transfer voice channel"
                action={
                    () => settings.store.voiceTransferConfirm
                        ? openChannelTransferConfirmModal(user.id, voiceChannelId)
                        : sendMessage(voiceChannelId, `!voice-transfer <@${user.id}>`)
                }
            />
        );

    if (settings.store.voiceModeration) {
        children.push(
            <Menu.MenuItem
                id="vc-user-permissions"
                label="Permissions"
            >
                <Menu.MenuItem
                    id="vc-user-perm-kick"
                    label="Kick users"
                    action={() => userTogglePermission(user.id, "kick")}
                    icon={userHasPermission(user.id, "kick") ? CheckmarkIcon : EmptyIcon}
                />
                <Menu.MenuItem
                    id="vc-user-perm-ban"
                    label="Ban/unban users"
                    action={() => userTogglePermission(user.id, "ban")}
                    icon={userHasPermission(user.id, "ban") ? CheckmarkIcon : EmptyIcon}
                />
                <Menu.MenuItem
                    id="vc-user-perm-limit"
                    label="Limit channel"
                    action={() => userTogglePermission(user.id, "limit")}
                    icon={userHasPermission(user.id, "limit") ? CheckmarkIcon : EmptyIcon}
                />
                <Menu.MenuItem
                    id="vc-user-perm-rename"
                    label="Rename channel"
                    action={() => userTogglePermission(user.id, "rename")}
                    icon={userHasPermission(user.id, "rename") ? CheckmarkIcon : EmptyIcon}
                />
                <Menu.MenuItem
                    id="vc-user-perm-lock"
                    label="Lock/unlock channel"
                    action={() => userTogglePermission(user.id, "lock")}
                    icon={userHasPermission(user.id, "lock") ? CheckmarkIcon : EmptyIcon}
                />
                <Menu.MenuItem
                    id="vc-user-perm-immunity"
                    label="Immune to kicks/bans"
                    action={() => userTogglePermission(user.id, "immunity")}
                    icon={userHasPermission(user.id, "immunity") ? CheckmarkIcon : EmptyIcon}
                />
            </Menu.MenuItem>
        );
    }
};

const ChannelContextMenuPatch: NavContextMenuPatchCallback = (children, { channel }: ChannelContextProps) => {
    if (!channel) return;

    // Ignore non-voice channels
    if (channel.type !== 2) return;

    // Get our current voice channel
    const voiceChannelId = SelectedChannelStore.getVoiceChannelId();

    // Get voice state of the selected user
    const userVoiceState = VoiceStateStore.getVoiceStateForUser(UserStore.getCurrentUser().id);
    if (!userVoiceState) return;

    // No voice channel or not the current one
    if (!voiceChannelId || userVoiceState.channelId !== voiceChannelId) return;

    if (settings.store.voiceEventLog) {
        children.push(
            <Menu.MenuItem
                id="vc-user-log"
                label="Event log"
                action={() => openVoiceChannelEventsModal(channel.id)}
            />
        );
    }

    if (settings.store.voiceLimit) {
        const userLimitOptionElements: JSX.Element[] = [];
        userLimitOptionElements.push(
            <Menu.MenuItem
                id="vc-change-limit-0"
                label="No limit"
                action={() => sendMessage(channel.id, "!voice-limit 0")}
            />
        );

        for (const option of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25])
            userLimitOptionElements.push(
                <Menu.MenuItem
                    id={"vc-change-limit-" + option}
                    label={option}
                    action={() => sendMessage(channel.id, `!voice-limit ${option}`)}
                />
            );

        userLimitOptionElements.push(
            <Menu.MenuItem
                id="vc-change-limit-custom"
                label="Set custom limit"
                action={() => openChannelLimitModal()}
            />
        );

        children.push(
            <Menu.MenuItem
                id="vc-change-limit"
                label="Change user limit"
            >
                {userLimitOptionElements}
            </Menu.MenuItem>
        );
    }

    if (settings.store.voiceRename) {
        if (settings.store.voiceRenamePresets.length > 0) {
            const ESCAPE_SEQUENCE = "#$#COMMA#$#";
            const voiceRenamePresets = settings.store.voiceRenamePresets
                .split("\\,").join(ESCAPE_SEQUENCE) // Escape commas
                .split(",")
                .map(x => x.split(ESCAPE_SEQUENCE).join(",")); // Unescape commas

            const voiceRenamePresetElements: JSX.Element[] = [];
            for (const [i, option] of Object.entries(voiceRenamePresets))
                voiceRenamePresetElements.push(
                    <Menu.MenuItem
                        id={"vc-rename-" + i}
                        label={option}
                        action={() => sendMessage(channel.id, `!voice-rename ${option}`)}
                    />
                );

            voiceRenamePresetElements.push(
                <Menu.MenuItem
                    id="vc-change-name"
                    label="Enter new name"
                    action={() => openChannelNameChangeModal()}
                />
            );

            children.push(
                <Menu.MenuItem
                    id="vc-change-name-presets"
                    label="Change name"
                >
                    {voiceRenamePresetElements}
                </Menu.MenuItem>
            );
        } else {
            children.push(
                <Menu.MenuItem
                    id="vc-change-name"
                    label="Change name"
                    action={() => openChannelNameChangeModal()}
                />
            );
        }
    }


    if (settings.store.voiceClaim)
        children.push(
            <Menu.MenuItem
                id="vc-claim"
                label="Claim channel"
                action={() => sendMessage(channel.id, "!voice-claim")}
            />
        );

    if (settings.store.voiceLock)
        children.push(
            <Menu.MenuItem
                id="vc-lock"
                label="Lock channel"
                action={() => sendMessage(channel.id, "!voice-lock")}
            />
        );

    if (settings.store.voiceUnlock)
        children.push(
            <Menu.MenuItem
                id="vc-unlock"
                label="Unlock channel"
                action={() => sendMessage(channel.id, "!voice-unlock")}
            />
        );

    if (settings.store.voiceHide)
        children.push(
            <Menu.MenuItem
                id="vc-hide"
                label="Hide channel"
                action={() => sendMessage(channel.id, "!voice-hide")}
            />
        );

    if (settings.store.voiceReveal)
        children.push(
            <Menu.MenuItem
                id="vc-reveal"
                label="Reveal channel"
                action={() => sendMessage(channel.id, "!voice-reveal")}
            />
        );
};

interface VoiceChannelEventsModalProps {
    modalProps: ModalProps;
    voiceChannelId: string;
}

const UserSummaryItem = findComponentByCodeLazy("defaultRenderUser", "showDefaultAvatarsForNullUsers");
const UserPopoutSection = findByCodeLazy(".lastSection", "children:");
const AvatarStyles = findByPropsLazy("moreUsers", "emptyUser", "avatarContainer", "clickableAvatar");

export function VoiceChannelEventsModal({ modalProps, voiceChannelId }: VoiceChannelEventsModalProps) {
    const channel = ChannelStore.getChannel(voiceChannelId);
    if (!channel) return null;

    const getUsername = (userId: string) => {
        const user = UserStore.getUser(userId);
        return user ? user.username : "<unknown>";
    };

    const copyUserName = (userId: string) => {
        const username = getUsername(userId);
        Clipboard.copy(username);
        Toasts.show({
            id: Toasts.genId(),
            message: "Copied username to clipboard: " + username,
            type: Toasts.Type.MESSAGE,
            options: {
                position: Toasts.Position.BOTTOM,
                duration: 1800
            }
        });
    };

    const createListItem = (ev: VoiceChannelEvent) => {
        const user = UserStore.getUser(ev.userId);

        // TODO: Check fo user existence (add placeholder if undefined)
        // TODO: Use user context menu instead of onClick copy handler
        return (
            <div className="auditLog_eebd33 row_cfe282" style={{ marginBottom: "8px" }} onClick={() => copyUserName(user.id)}>
                <div className="headerClickable_eebd33 header_eebd33" style={{ width: "auto" }} aria-expanded="false" role="listitem" tabIndex={-1}>
                    {ev.type === "join" ? <UserWaveIcon /> : <CallHangupIcon />}
                    {/* <div className="icon_eebd33 typeCreate_eebd33 targetInvite_eebd33"></div> */}
                    <div className="wrapper_c51b4e pointer_c51b4e avatar_eebd33" tabIndex={0} aria-hidden="true" role="button" style={{ width: "25px", height: "25px" }}>
                        <svg width="25" height="25" viewBox="0 0 25 25" className="mask_c51b4e svg_c51b4e" aria-hidden="true">
                            <foreignObject x="0" y="0" width="25" height="25" mask="url(#svg-mask-avatar-default)">
                                <div className="avatarStack_c51b4e">
                                    <img src={user.getAvatarURL(channel.getGuildId())} alt=" " className="avatar_c51b4e" aria-hidden="true" />
                                </div>
                            </foreignObject>
                        </svg>
                        {/* <UserSummaryItem
                            users={[UserStore.getUser("1157043198833733692")]}
                            count={1}
                            guildId={channel.getGuildId()}
                            renderIcon={false}
                            site={40}
                            showDefaultAvatarsForNullUsers
                            showUserPopout
                            renderUser={(_user: User) => (
                                <Clickable className={AvatarStyles.clickableAvatar}>
                                    <img
                                        className={AvatarStyles.avatar}
                                        src={user.getAvatarURL(void 0, 80, true)}
                                        alt={user.username}
                                        title={user.username}
                                    />
                                </Clickable>
                            )}
                        /> */}
                    </div>
                    <div className="timeWrap_eebd33">
                        <div className="title_eebd33">
                            <div className="overflowEllipsis_eebd33">
                                <span className="userHook_eebd33">
                                    <div className="defaultColor_a595eb text-md/normal_dc00ef" data-text-variant="text-md/normal">{user.username}</div>
                                </span> {ev.type === "join" ? "joined" : "left"}
                            </div>
                        </div>
                        <div className="defaultColor_a595eb text-sm/normal_dc00ef timestamp_eebd33" data-text-variant="text-sm/normal">
                            {
                                (startTime && ((ev.at - startTime) < 4000)) // TODO: Shit (try to not show timestamps for old events)
                                    ? null
                                    : (
                                        <Timestamp
                                            className={cl("timestamp")}
                                            timestamp={new Date(ev.at)}
                                            isEdited={true}
                                            isInline={false}
                                        />
                                    )
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <ModalRoot {...modalProps} size={ModalSize.DYNAMIC}>
            <ModalHeader>
                <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>Event log: {channel.name}</Text>
            </ModalHeader>

            <ModalContent className={cl("content")}>
                <Forms.FormSection>
                    <div style={{ minWidth: "480px" }} role="list" tabIndex={0} data-list-id="audit-log">
                        {voiceChannelEvents[voiceChannelId].reverse().map(ev => createListItem(ev))}
                    </div>
                </Forms.FormSection>
            </ModalContent>
        </ModalRoot >
    );
};

interface TextInputModalProps {
    modalProps: ModalProps;
    modalHeading: string;
    inputLabel: string;
    submitButtonText: string;
    submitCallback: (result: string) => void;
}

export function TextInputModal({ modalProps, modalHeading, inputLabel, submitButtonText, submitCallback }: TextInputModalProps) {
    let inputResult = "";

    const me = UserStore.getCurrentUser();
    const userVoiceState = VoiceStateStore.getVoiceStateForUser(me.id);
    if (!userVoiceState) return null;

    const onSave = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        submitCallback(inputResult);
        modalProps.onClose();
    };

    return (
        <ModalRoot {...modalProps}>
            <ModalHeader>
                <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>{modalHeading}</Text>
            </ModalHeader>

            {/* form is here so when you press enter while in the text input it submits */}
            <form onSubmit={onSave}>
                <ModalContent className={cl("content")}>
                    <Forms.FormSection>
                        <Forms.FormTitle>{inputLabel}</Forms.FormTitle>
                        <TextInput
                            onChange={e => inputResult = e}
                        />
                    </Forms.FormSection>
                </ModalContent>
                <ModalFooter>
                    <Button type="submit" onClick={onSave}>{submitButtonText}</Button>
                </ModalFooter>
            </form>
        </ModalRoot>
    );
}

interface ConfirmModalProps {
    modalProps: ModalProps;
    modalHeading: string;
    confirmText: string;
    cancelText: string;
    submitCallback: (confirmed: boolean) => void;
}

export function ConfirmModal({ modalProps, modalHeading, confirmText = "Confirm", cancelText = "Cancel", submitCallback, children }: PropsWithChildren<ConfirmModalProps>) {
    const me = UserStore.getCurrentUser();
    const userVoiceState = VoiceStateStore.getVoiceStateForUser(me.id);
    if (!userVoiceState) return null;

    const submit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>, confirmed: boolean) => {
        e.preventDefault();
        submitCallback(confirmed);
        modalProps.onClose();
    };


    return (
        <ModalRoot {...modalProps}>
            <ModalHeader>
                <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>{modalHeading}</Text>
            </ModalHeader>

            <ModalContent className={cl("content")}>
                <Forms.FormSection>
                    {children}
                </Forms.FormSection >
            </ModalContent>
            <ModalFooter>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridGap: "1em" }}>
                    <Button
                        style={{ left: "0 !important" }}
                        size={Button.Sizes.MEDIUM}
                        onClick={e => submit(e, true)}
                    >
                        {confirmText}
                    </Button>
                    <Button
                        style={{ right: "0 !important" }}
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.RED}
                        onClick={e => submit(e, false)}
                    >
                        {cancelText}
                    </Button>
                </div>
            </ModalFooter>
        </ModalRoot>
    );
}

export const openVoiceChannelEventsModal = (voiceChannelId: string) =>
    openModalLazy(async () => {
        return modalProps => <VoiceChannelEventsModal
            modalProps={modalProps}
            voiceChannelId={voiceChannelId}
        />;
    });

export const openChannelNameChangeModal = () =>
    openModalLazy(async () => {
        return modalProps => <TextInputModal
            modalProps={modalProps}
            modalHeading="Change channel name"
            inputLabel="New channel name"
            submitButtonText="Save"
            submitCallback={result => sendMessage(SelectedChannelStore.getVoiceChannelId() as string, `!voice-rename ${result}`)}
        />;
    });

export const openChannelLimitModal = () =>
    openModalLazy(async () => {
        return modalProps => <TextInputModal
            modalProps={modalProps}
            modalHeading="Change channel user limit"
            inputLabel="New user limit"
            submitButtonText="Save"
            submitCallback={result => sendMessage(SelectedChannelStore.getVoiceChannelId() as string, `!voice-limit ${parseInt(result)}`)}
        />;
    });

export const openChannelTransferConfirmModal = (userId: string, channelId: string) =>
    openModalLazy(async () => {
        const user = UserStore.getUser(userId);
        return modalProps => <ConfirmModal

            modalProps={modalProps}
            modalHeading="Transfer channel"
            confirmText="Transfer channel"
            cancelText="Cancel"
            submitCallback={confirmed => confirmed && sendMessage(channelId, `!voice-transfer <@${userId}>`)}
        >
            <div style={{ display: "inline-flex" }}>
                <Forms.FormText variant="text-lg/medium" style={{ marginRight: "6px" }}><span style={{ lineHeight: "24px" }}>Transfer the current voice channel to </span></Forms.FormText>
                <UserSummaryItem
                    users={[user]}
                    count={1}
                    guildId={channelId}
                    renderIcon={false}
                    site={40}
                    showDefaultAvatarsForNullUsers
                    showUserPopout
                />
                <Forms.FormText variant="text-lg/medium" style={{ marginLeft: "4px" }}><span style={{ lineHeight: "24px" }}> {user.username}?</span></Forms.FormText>
            </div>
        </ConfirmModal >;
    });

const settings = definePluginSettings({
    voiceKick: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-kick shortcut to user context menus",
        default: true
    },
    voiceBan: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-ban shortcut to user context menus",
        default: true
    },
    voiceUnban: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-unban shortcut to user context menus",
        default: true
    },
    voiceBlock: {
        type: OptionType.BOOLEAN,
        description: "Adds the option to block a user to context menus",
        default: false
    },
    voiceUnblock: {
        type: OptionType.BOOLEAN,
        description: "Adds the option to unblock a user to context menus",
        default: false
    },
    voiceTransfer: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-transfer shortcut to user context menus",
        default: true
    },
    voiceTransferConfirm: {
        type: OptionType.BOOLEAN,
        description: "Whether to confirm voice channel transfers",
        default: true
    },
    voiceModeration: {
        type: OptionType.BOOLEAN,
        description: "Add context menu options to assign moderation permissions",
        default: true
    },
    voiceModeratorImmunity: {
        type: OptionType.BOOLEAN,
        description: "Whether to make users with at least one moderation permission immune to kicks and bans by other moderators",
        default: true
    },
    voiceEventLog: {
        type: OptionType.BOOLEAN,
        description: "Add event logs to voice channel context menus",
        default: true
    },
    voiceLimit: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-limit shortcut to channel context menus",
        default: true
    },
    voiceRename: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-rename shortcut to channel context menus",
        default: true
    },
    voiceRenamePresets: {
        type: OptionType.STRING,
        description: "Preset names to show in the rename menu (comma-separated, escape commas using \\,)",
        default: ""
    },
    voiceClaim: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-claim shortcut to channel context menus",
        default: true
    },
    voiceLock: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-lock shortcut to channel context menus",
        default: true
    },
    voiceUnlock: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-unlock shortcut to channel context menus",
        default: true
    },
    voiceHide: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-hide shortcut to channel context menus",
        default: false
    },
    voiceReveal: {
        type: OptionType.BOOLEAN,
        description: "Add !voice-reveal shortcut to channel context menus",
        default: false
    },
    blockedUserIDs: {
        type: OptionType.STRING,
        description: "IDs of blocked users (comma-separated)",
        default: ""
    },
    moderatorUserConfig: {
        type: OptionType.STRING,
        description: "Moderator configuration (format: {\"<user id>\": [\"kick\", \"ban\", \"limit\", \"lock\", \"rename\"]})",
        default: "{}"
    }
});

export default definePlugin({
    name: "VoiceCommands",
    description: "Adds context menu options for managing voice channels (!voice-kick, !voice-lock ...)",
    authors: [{ name: "aequabit", id: 934357855853748264n }],
    flux: {
        VOICE_STATE_UPDATES: onVoiceStateUpdates,
        MESSAGE_CREATE: onMessageCreate
    },
    settings,
    contextMenus: {
        "user-context": UserContextMenuPatch,
        "channel-context": ChannelContextMenuPatch
    },
    async start() {
        startTime = Date.now();
    },
});
