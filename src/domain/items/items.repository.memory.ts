import { ItemsRepository } from "./items.repository";
import { Item } from "./items.types";

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function createInMemoryItemsRepository(): ItemsRepository {
    return {
        async loadItems(): Promise<Item[]> {
            await delay(300);
            return [];
        },

        async createItem(title: string): Promise<Item> {
            await delay(200);
            if (Math.random() < 0.2) throw new Error("Create failed");

            return {
                id: crypto.randomUUID(),
                title,
                selected: false,
            };
        },

        async deleteItems(ids: string[]): Promise<void> {
            await delay(200);
            if (Math.random() < 0.2) throw new Error("Delete failed");
        },
    };
};