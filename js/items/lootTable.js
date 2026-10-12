import { itemDatabase } from './items.js';
// Uniwersalna funkcja losująca przedmioty z tabeli lootu
export function rollLoot(lootTable) {
  if (!lootTable || !Array.isArray(lootTable)) return [];
  const dropped = [];
  for (const entry of lootTable) {
    if (Math.random() <= entry.chance) {
      const min = entry.min || 1;
      const max = entry.max || 1;
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      const itemInfo = itemDatabase[entry.itemId];
      if (itemInfo) {
        // ROZSYPUJEMY: Każda sztuka wypada jako osobny przedmiot na ziemię!
        for (let i = 0; i < count; i++) {
          dropped.push({
            ...itemInfo,
            count: 1
          });
        }
      }
    }
  }
  return dropped;
}