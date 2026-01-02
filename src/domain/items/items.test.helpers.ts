import { Item, ItemsState } from "./items.types"

export type ReadyItemsState = Extract<ItemsState, { status: "ready" }>;

export function item(overrides?: Partial<Item>): Item {
    return {
        id: "1",
        title: "Item 1",
        selected: false,
        ...overrides
    }
}

export function readyState(overrides?: Partial<ReadyItemsState>): ReadyItemsState {
    return {
        status: "ready",
        items: [],
        create: { kind: "idle" },
        delete: { kind: "idle" },
        ...overrides
    }
}

export function readyStateWithItems(
    items: Item[],
    overrides?: Partial<Omit<ReadyItemsState, "items">>
): ReadyItemsState {
    return readyState({ items, ...overrides });
}

export function snapshotItems(): Item[] {
    return [
        item({ id: "1", title: "Item 1", selected: true }),
        item({ id: "2", title: "Item 2", selected: false })
    ];
}

export function filteredItems(snapshot: Item[]): Item[] {
    return snapshot.filter(i => !i.selected);
}