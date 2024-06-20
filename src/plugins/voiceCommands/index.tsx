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
import { definePluginSettings, Settings } from "@api/Settings";
import { classNameFactory } from "@api/Styles";
import { Devs } from "@utils/constants";
import { ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, openModalLazy } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { findStoreLazy } from "@webpack";
import { Button, ChannelStore, Forms, Menu, RestAPI, SelectedChannelStore, SnowflakeUtils, Text, TextInput, UserStore } from "@webpack/common";
import type { Channel, User } from "discord-types/general";

interface UserContextProps {
    channel: Channel;
    guildId?: string;
    user: User;
}

interface ChannelContextProps {
    channel: Channel;
}

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

function sendMessage(channelId: string, content: string) {
    RestAPI.post({
        url: `/channels/${channelId}/messages`,
        body: {
            channel_id: channelId,
            content: content,
            nonce: SnowflakeUtils.fromTimestamp(Date.now()),
            sticker_ids: [],
            type: 0,
            attachments: [],
            message_reference: null,
        }
    });
}

function getBlockedUsers(): string[] {
    const blockedUserList: string = Settings.plugins.VoiceCommands?.blockedUserIDs;

    // Hope this helps
    return blockedUserList
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

const onVoiceStateUpdates = ({ voiceStates }: { voiceStates: VoiceState[]; }) => {
    const me = UserStore.getCurrentUser();

    // Get our current voice state of the selected user
    const userVoiceState = VoiceStateStore.getVoiceStateForUser(me.id);
    if (!userVoiceState) return;

    const voiceChannelId = userVoiceState.channelId;

    // Ignore Stage Channels
    if (ChannelStore.getChannel(voiceChannelId)?.type === 13) return;

    for (const state of voiceStates) {
        const { userId, channelId, oldChannelId } = state;
        if (userId === me.id) continue; // It's us
        if (channelId !== voiceChannelId) continue; // User is not in our channel
        if (!getBlockedUsers().includes(userId)) continue; // User isn't blocked

        sendMessage(voiceChannelId, `!voice-ban <@${userId}>`);
    }
};

const UserContextMenuPatch: NavContextMenuPatchCallback = (children, { user }: UserContextProps) => {
    if (!user || user.id === UserStore.getCurrentUser().id) return;

    // Get our current voice channel
    const voiceChannelId = SelectedChannelStore.getVoiceChannelId();
    if (!voiceChannelId) return;

    // Get voice state of the selected user
    const userVoiceState = VoiceStateStore.getVoiceStateForUser(user.id);
    if (!userVoiceState) return;

    // Check if the selected user is in the same channel as us
    if (userVoiceState.channelId !== voiceChannelId) return;

    if (settings.store.voiceKick)
        children.push(
            <Menu.MenuItem
                id="vc-kick-user"
                label="Kick user"
                action={() => sendMessage(voiceChannelId, `!voice-kick <@${userVoiceState.userId}>`)}
            />
        );

    if (settings.store.voiceBan)
        children.push(
            <Menu.MenuItem
                id="vc-ban-user"
                label="Ban user"
                action={() => sendMessage(voiceChannelId, `!voice-ban <@${userVoiceState.userId}>`)}
            />
        );

    if (settings.store.voiceUnban)
        children.push(
            <Menu.MenuItem
                id="vc-unban-user"
                label="Unban user"
                action={() => sendMessage(voiceChannelId, `!voice-unban <@${userVoiceState.userId}>`)}
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

    if (settings.store.voiceTransfer)
        children.push(
            <Menu.MenuItem
                id="vc-transfer"
                label="Transfer voice channel"
                action={() => sendMessage(voiceChannelId, `!voice-transfer <@${userVoiceState.userId}>`)}
            />
        );
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

    if (settings.store.voiceLimit) {
        const userLimitOptionElements: JSX.Element[] = [];
        userLimitOptionElements.push(
            <Menu.MenuItem
                id="vc-change-limit-0"
                label="No limit"
                action={() => sendMessage(channel.id, `!voice-limit 0`)}
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
    }
});

export default definePlugin({
    name: "VoiceCommands",
    description: "Adds context menu options for managing voice channels (!voice-kick, !voice-lock ...)",
    authors: [{ name: "aequabit", id: 934357855853748264n }],
    flux: {
        VOICE_STATE_UPDATES: onVoiceStateUpdates
    },
    settings,
    contextMenus: {
        "user-context": UserContextMenuPatch,
        "channel-context": ChannelContextMenuPatch
    }
});
