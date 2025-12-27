import { ItemsRepository } from "./items.repository";
import { Item, ItemsAction } from "./items.types"

type Dispatch = (action: ItemsAction) => void;

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function createItemsEffects(
    repo: ItemsRepository,
    dispatch: Dispatch
) {
    let loadRequestSeq = 0;
    let createRequestSeq = 0;
    let deleteRequestSeq = 0;

    async function loadItems() {
        const requestId = ++loadRequestSeq;

        dispatch({ type: "LOAD_START", requestId });

        try {
            await delay(100);

            const items: Item[] = [
                { id: "1", title: "First", selected: false },
                { id: "2", title: "Second", selected: false },
                { id: "3", title: "Third", selected: false },
            ]

            dispatch({ type: "LOAD_SUCCESS", requestId, items });
        } catch (err) {
            dispatch({ type: "LOAD_ERROR", requestId, error: "Failed to load items" });
        }
    }

    async function addItem(title: string) {
        const requestId = ++createRequestSeq;

        dispatch({ type: "CREATE_START", requestId });

        const item = await getItem(title);

        if (!item) {
            dispatch({
                type: "CREATE_ERROR",
                requestId,
                error: "The new item could not be added"
            });

            return;
        }

        dispatch({ type: "CREATE_SUCCESS", requestId, item });
    }
    async function deleteItems(deleted: Item[]) {
        const requestId = ++deleteRequestSeq;
        dispatch({ type: "DELETE_START", requestId });

        await delay(300);

        if (Math.random() < 0.3) {
            dispatch({
                type: "DELETE_ERROR",
                requestId,
                error: `Delete failed`
            });

            return;
        }

        dispatch({ type: "DELETE_SUCCESS", requestId });
    }

    async function toggleItemSelection(
        id: string,
        selected: boolean
    ): Promise<void> {
        dispatch({ type: "SELECT_ITEM", id, selected });
    }

    return {
        loadItems,
        addItem,
        deleteItems,
        toggleItemSelection,
    };
}

async function getItem(title: string): Promise<Item | undefined> {
    await delay(1);

    return Math.random() < 0.3 ? undefined : {
        id: crypto.randomUUID(),
        title,
        selected: false
    };
}