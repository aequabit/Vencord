# 🔊 Vencord Voice Tools

> 🛠️ A Vencord plugin adding powerful voice channel moderation and shortcuts to your context menus.

---

## ✨ Features

Quickly manage voice channels & users directly from context menus:

-   `!voice-kick` – Kick users from VC
-   `!voice-ban` / `!voice-unban` – Temporarily ban/unban users from VC
-   `!voice-lock` / `!voice-unlock` – Lock or unlock VC
-   `!voice-claim` – Claim ownership of the VC
-   `!voice-limit` – Set user limit
-   `!voice-rename` – Rename VC (with presets)
-   `!voice-hide` / `!voice-reveal` – Hide or reveal the VC
-   `!voice-transfer` – Move users to other channels (with confirmation option)
-   Block/unblock specific users
-   Assign voice moderation permissions
-   Event logging in channel menus
-   Moderator immunity options

---

## ⚙️ Configuration Options

All options are available in the plugin settings (with defaults shown):

| Option                   | Type    | Description                                                       | Default |
| ------------------------ | ------- | ----------------------------------------------------------------- | ------- |
| `voiceKick`              | Boolean | Add `!voice-kick` to user context menus                           | ✅      |
| `voiceBan`               | Boolean | Add `!voice-ban` to user context menus                            | ✅      |
| `voiceUnban`             | Boolean | Add `!voice-unban` to user context menus                          | ✅      |
| `voiceBlock`             | Boolean | Add block/unblock user option                                     | ❌      |
| `voiceTransfer`          | Boolean | Add `!voice-transfer` to user menus                               | ✅      |
| `voiceTransferConfirm`   | Boolean | Confirm transfers                                                 | ✅      |
| `voiceModeration`        | Boolean | Add moderation permission options                                 | ✅      |
| `voiceModeratorImmunity` | Boolean | Immunity for moderators                                           | ✅      |
| `voiceEventLog`          | Boolean | Event logs in channel menus                                       | ✅      |
| `voiceLimit`             | Boolean | Add `!voice-limit` to channel menus                               | ✅      |
| `voiceRename`            | Boolean | Add `!voice-rename` to channel menus                              | ✅      |
| `voiceRenamePresets`     | String  | Preset names for rename menu (comma‑separated, escape with `\\,`) | `""`    |
| `voiceClaim`             | Boolean | Add `!voice-claim` to channel menus                               | ✅      |
| `voiceLock`              | Boolean | Add `!voice-lock` to channel menus                                | ✅      |
| `voiceUnlock`            | Boolean | Add `!voice-unlock` to channel menus                              | ✅      |
| `voiceHide`              | Boolean | Add `!voice-hide` to channel menus                                | ❌      |
| `voiceReveal`            | Boolean | Add `!voice-reveal` to channel menus                              | ❌      |
| `blockedUserIDs`         | String  | IDs of blocked users (comma‑separated)                            | `""`    |
| `moderatorUserConfig`    | String  | JSON config `{ "<user id>": ["kick", "ban", ...] }`               | `"{}"`  |

---

## 📥 Installation

### 🏷 Download

-   [Latest release on GitHub](https://github.com/aequabit/Vencord/releases)
-   Or check `#updates` in Discord

---

### 🖥 Vesktop (recommended)

1. Extract the archive to a folder
2. In Discord:
    - Go to **Settings → Vencord → Vesktop Settings**
    - Open **Developer Settings**
    - Click **Vencord Location → Change**
    - Select your extracted folder

---

### ⚙️ VencordInstaller / VencordInstallerCli

1. Delete all existing files in Vencord's `dist` folder
2. Extract the archive into that folder

**Windows:**

```text
C:\Users\USER\AppData\Roaming\Vencord\dist
```

**Linux:**

```text
~/.config/Vencord/dist
```
