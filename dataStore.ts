// dataStore.ts
// Made with <3 by kazwaztaken

// Try this explicit import if the simple '*' import is failing:
import { get, set } from "@api/DataStore";
import { Logger } from "@utils/Logger";

const logger = new Logger("TextPrefix:DataStore");
export type SelectionMap = Record<string, string>;
const STORAGE_KEY = "TextPrefix_channelSelections_v1";
const DEFAULT_MAP: SelectionMap = {};

/**
 * Load channel -> prefix selection map from Vencord DataStore.
 */
export async function loadSelections(): Promise<SelectionMap> {
  try {
    // Use the explicitly imported 'get' function
    const result = await get(STORAGE_KEY);
    
    if (result && typeof result === "object") {
        return result;
    }

    return DEFAULT_MAP;
    
  } catch (e) {
    logger.error("Failed to load selections from DataStore", e);
    return DEFAULT_MAP; 
  }
}

/**
 * Save channel -> prefix selection map to Vencord DataStore.
 */
export async function saveSelections(map: SelectionMap): Promise<void> {
  try {
    // Use the explicitly imported 'set' function
    await set(STORAGE_KEY, map);
  } catch (e) {
    logger.error("Failed to save selections to DataStore", e);
  }
}