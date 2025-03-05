// Type definitions for Chrome extension APIs
interface Chrome {
  storage: Chrome.Storage;
  tabs: Chrome.Tabs;
}

namespace Chrome {
  interface Storage {
    sync: {
      get: (keys: string[] | string | null) => Promise<Record<string, any>>;
      set: (items: Record<string, any>) => Promise<void>;
    };
  }

  interface Tab {
    id?: number;
    url?: string;
  }

  interface Tabs {
    query: (queryInfo: { active: boolean; currentWindow: boolean }) => Promise<Tab[]>;
    sendMessage: (tabId: number, message: any) => Promise<any>;
  }
}

// Check if we're in a Chrome extension environment
const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

// Mock implementation for development environment
const mockStorage: Chrome.Storage = {
  sync: {
    get: async (keys) => {
      const storage = localStorage.getItem('mockChromeStorage');
      const data = storage ? JSON.parse(storage) : {};
      
      if (keys === null) {
        return data;
      }
      
      const keysArray = typeof keys === 'string' ? [keys] : keys;
      return keysArray.reduce((acc, key) => ({
        ...acc,
        [key]: data[key]
      }), {});
    },
    set: async (items) => {
      const storage = localStorage.getItem('mockChromeStorage');
      const data = storage ? JSON.parse(storage) : {};
      const newData = { ...data, ...items };
      localStorage.setItem('mockChromeStorage', JSON.stringify(newData));
    }
  }
};

const mockTabs: Chrome.Tabs = {
  query: async () => [{ 
    id: 1,
    url: 'http://localhost:5173'
  }],
  sendMessage: async (tabId, message) => {
    console.log('Mock sending message to tab:', tabId, message);
    return {
      content: 'This is mock content for development. In the actual extension, this will be the page content.'
    };
  }
};

// Use real Chrome APIs if available, otherwise use mocks
export const chrome: Chrome = isChromeExtension 
  ? window.chrome as unknown as Chrome 
  : {
      storage: mockStorage,
      tabs: mockTabs
    };