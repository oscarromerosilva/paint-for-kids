import { type IDBPDatabase, openDB } from "idb";

const DB_NAME = "KidsDrawingPWA";
const DB_VERSION = 1;
const STORE_NAME = "drawings";
const CURRENT_DRAWING_KEY = "current_drawing";

let dbPromise: Promise<IDBPDatabase<unknown>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export const drawingService = {
  // biome-ignore lint/suspicious/noExplicitAny: necessary for loading the drawing
  async saveCurrentDrawing(json: any): Promise<void> {
    const db = await getDB();
    await db.put(STORE_NAME, json, CURRENT_DRAWING_KEY);
  },
  // biome-ignore lint/suspicious/noExplicitAny: necessary for loading the drawing
  async loadCurrentDrawing(): Promise<any | null> {
    const db = await getDB();
    return await db.get(STORE_NAME, CURRENT_DRAWING_KEY);
  },

  async clearCurrentDrawing(): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, CURRENT_DRAWING_KEY);
  },

  downloadPNG(dataUrl: string, filename = "my_drawing.png") {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};
