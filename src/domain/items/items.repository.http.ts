import { ItemsRepository } from "./items.repository";
import { Item } from "./items.types";

type ApiItem = {
    id: string;
    title: string;
}

function assertOk(res: Response) {
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

function toDomainItem(api: ApiItem): Item {
    return { ...api, selected: false };
}

export function createHttpItemsRepository(baseUrl: string): ItemsRepository {
    return {
        async loadItems(): Promise<Item[]> {
            const res = await fetch(`${baseUrl}/items`);
            assertOk(res);
            const data = (await res.json()) as ApiItem[];
            return data.map(toDomainItem);
        },

        async createItem(title: string): Promise<Item> {
            const res = await fetch(`${baseUrl}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            });
            assertOk(res);
            const data = (await res.json()) as ApiItem;
            return toDomainItem(data);
        },

        async deleteItems(ids: string[]): Promise<void> {
            const res = await fetch(`${baseUrl}/items`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids })
            });
            assertOk(res);
        },
    };
}