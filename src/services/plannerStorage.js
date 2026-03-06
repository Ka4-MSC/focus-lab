const STORAGE_KEY = 'focusPlanner';

const defaultDay = () => ({
  work: { main: null, tasks: [] },
  life: { main: null, tasks: [] },
  reflection: ''
});

function readStore() {
  if (typeof window === 'undefined') {
    return {};
  }
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
}

function writeStore(store) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function ensureDay(store, date) {
  if (!store[date]) {
    store[date] = defaultDay();
  }
  return store;
}

export const plannerStorage = {
  getDay(date) {
    const store = ensureDay(readStore(), date);
    writeStore(store);
    return store[date];
  },
  saveDay(date, dayData) {
    const store = ensureDay(readStore(), date);
    store[date] = dayData;
    writeStore(store);
  },
  getStore() {
    return readStore();
  }
};
