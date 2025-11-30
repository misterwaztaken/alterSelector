import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";
import PrefixManagerComponent from "./PrefixManager";

export interface PrefixEntry {
    id: string;
    label: string;
    text: string;
}

// Store JSON as a string, because OptionType.JSON does not exist
export const settings = definePluginSettings({
    prefixEntries: {
        type: OptionType.STRING,
        description: "Internal storage for prefix entries.",
        default: "[]",           // Stored as stringified JSON
        hidden: true
    },

    prefixManagerUI: {
        type: OptionType.COMPONENT,
        description: "Manage your custom prefixes.",
        component: PrefixManagerComponent // Lazy-loaded
    },

    // extra options that are not alter-specific go here
    debug: {
        type: OptionType.BOOLEAN,
        description: "Debug Mode",
        default: false
    }
});

// --- Convenience helpers (optional, but recommended) ---

export function getPrefixEntries(): PrefixEntry[] {
    try {
        return JSON.parse(settings.store.prefixEntries);
    } catch {
        return [];
    }
}

export function setPrefixEntries(entries: PrefixEntry[]) {
    settings.store.prefixEntries = JSON.stringify(entries, null, 2);
}
