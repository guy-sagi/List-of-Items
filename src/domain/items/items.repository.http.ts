import { ItemsRepository } from "./items.repository";
import { Item } from "./items.types";
import { fetchJson } from "../../lib/http/fetchJson";

type ApiItem = { id: string; title: string };

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

function toDomainItem(api: ApiItem): Item {
    return { ...api, selected: false };
}

export function createHttpItemsRepository(): ItemsRepository {
    return {
        async loadItems(): Promise<Item[]> {
            const data = await fetchJson<ApiItem[]>(`${BASE_URL}/items`);
            return data.map(toDomainItem);
        },

        async createItem(title: string) {
            const data = await fetchJson<ApiItem>(`${BASE_URL}/items`, {
                method: "POST",
                body: JSON.stringify({ title })
            });
            return toDomainItem(data);
        },

        async deleteItems(ids: string[]) {
            await fetchJson<void>(`${BASE_URL}/items`, {
                method: "DELETE",
                body: JSON.stringify({ ids })
            });
        },
    };
}