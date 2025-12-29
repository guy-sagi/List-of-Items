import { Item } from "./items.types";

export type ItemsRepository = {
    loadItems(): Promise<Item[]>;
    createItem(title: string): Promise<Item>;
    deleteItems(ids: string[]): Promise<void>;
}