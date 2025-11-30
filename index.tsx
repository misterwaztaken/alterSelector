/*
 * AlterSelector — Vencord plugin
 * Prepends a user-chosen prefix to outgoing messages on a per-channel basis.
 * Made by kazwaztaken <3
 */

import definePlugin from "@utils/types";
import ChatDrop from "./ChatDrop";
import { Logger } from "@utils/Logger";
import { React } from "@webpack/common";
import { settings, getPrefixEntries } from "./settings";
import { loadSelections, saveSelections } from "./dataStore";

const logger = new Logger("AlterSelector");

const TEXT_PREFIX_RULES_CHANNEL_ID = "1102784112584040479"; // keep channel used for sharing rules (if needed)

export default definePlugin({
    name: "AlterSelector",
    description: "funny prefixes for the funny people inside your funny head. \nMade by kazwaztaken, because it didn't exist",
    authors: [{ name: "kazwaztaken", id: 756603184113516694n }], 
    chatBarButton: {
        render: (props) => <ChatDrop {...props} settings={settings} />,
        icon: () => <span></span>,
    },
    settings,

    start() {
        try { console.info('[AlterSelector] starting plugin (onBeforeMessageSend only)'); } catch {}

        // Expose a small debug helper for DevTools  lightweight and synchronous
        try {
            (globalThis as any).__AlterSelector = {
                getPrefixEntries: () => getPrefixEntries(),
                loadSelections: () => loadSelections(),
                saveSelections: (map: Record<string, string>) => saveSelections(map)
            };
            try { console.info('[AlterSelector] debug helpers exposed as __AlterSelector on globalThis'); } catch {}
        } catch (e) {
            try { console.warn('[AlterSelector] failed to expose debug helpers', e); } catch {}
        }
    },
    stop() {
        try { console.info('[AlterSelector] stopping plugin'); } catch {}
        try {
            const unbind = (globalThis as any).__AlterSelector_unbind;
            if (typeof unbind === 'function') try { unbind(); delete (globalThis as any).__AlterSelector_unbind; } catch {}
        } catch {}
        try { delete (globalThis as any).__AlterSelector; } catch {}
    },
    // onBeforeMessageSend is allowed to be async in many plugin APIs; if your environment
    // requires sync, you can make this sync by using a synchronous storage method.
    async onBeforeMessageSend(channelId: string, msg: { content: string }) {
        logger.log("onbeforemessagesend is working.....")
        try {
            // don't touch the rules channel
            if (channelId === TEXT_PREFIX_RULES_CHANNEL_ID) return;
        
            // nothing to do if message empty
            if (!msg?.content) return;
        
            // load per-channel selection map
            const map = await loadSelections();
            const selection = map[channelId] ?? map["global"] ?? "none";
        
            if (!selection || selection === "none") return;
        
            const prefixes = getPrefixEntries();
            const entry = prefixes.find(e => e.id === selection);
        
            if (!entry || !entry.text) return;
        
            // Avoid double-applying same prefix (exact text match at start)
            if (msg.content.startsWith(entry.text)) return;
        
            // Prepend with a space if needed
            const separator = entry.text.endsWith(" ") ? "" : " ";
            msg.content = `${entry.text}${separator}${msg.content}`.trim();      
            logger.log(msg.content);
        } catch (e) {
            logger.error("Failed to apply prefix:", e);
        }
    }
});
