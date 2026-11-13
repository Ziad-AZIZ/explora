// src/utils/mapStore.js
let selectedMapItem = null;

export const setSelectedMapItem = (item) => {
  selectedMapItem = item;
};

export const getSelectedMapItem = () => {
  return selectedMapItem;
};

export const clearSelectedMapItem = () => {
  selectedMapItem = null;
};