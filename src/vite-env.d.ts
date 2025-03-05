/// <reference types="vite/client" />

declare namespace Chrome {
  export interface Storage {
    sync: {
      get(keys: string[]): Promise<{ [key: string]: any }>;
      set(items: { [key: string]: any }): Promise<void>;
    };
  }

  export interface Tabs {
    query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<{ id: number; url: string }[]>;
    sendMessage(tabId: number, message: any): Promise<any>;
  }
}

interface Chrome {
  storage: Chrome.Storage;
  tabs: Chrome.Tabs;
}