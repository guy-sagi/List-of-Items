import { ItemsRepository } from "./items.repository";
import { ItemsAction } from "./items.types"

type Dispatch = (action: ItemsAction) => void;

export function createItemsEffects(
    repo: ItemsRepository,
    dispatch: Dispatch
) {
    let loadRequestSeq = 0;
    let createRequestSeq = 0;
    let deleteRequestSeq = 0;
    const UNDO_TIMEOUT_MS = 5000;

    async function loadItems() {
        const requestId = ++loadRequestSeq;
        dispatch({ type: "LOAD_START", requestId });

        try {
            const items = await repo.loadItems();
            dispatch({ type: "LOAD_SUCCESS", requestId, items });
        } catch (err) {
            dispatch({ type: "LOAD_ERROR", requestId, error: "Failed to load items" });
        }
    }

    async function addItem(title: string) {
        const requestId = ++createRequestSeq;
        dispatch({ type: "CREATE_START", requestId });

        try {
            const item = await repo.createItem(title);
            dispatch({ type: "CREATE_SUCCESS", requestId, item });
        } catch (err) {
            dispatch({
                type: "CREATE_ERROR",
                requestId,
                error: err instanceof Error ? err.message : "Create failed"
            });
        }
    }

    async function deleteItems(ids: string[]) {
        const requestId = ++deleteRequestSeq;
        dispatch({ type: "DELETE_START", requestId });

        try {
            await repo.deleteItems(ids)

            setTimeout(() => {
                dispatch({ type: "DELETE_COMMIT", requestId });
            }, UNDO_TIMEOUT_MS);
        } catch (err) {
            dispatch({
                type: "DELETE_ERROR",
                requestId,
                error: err instanceof Error ? err.message : `Delete failed`
            });
        }
    }

    function undoDelete(requestId: number) {
        dispatch({ type: "DELETE_UNDO", requestId });
    }

    async function retryDelete(requestId: number, ids: string[]) {
        dispatch({ type: "DELETE_RETRY", requestId });

        try {
            await repo.deleteItems(ids);
            dispatch({ type: "DELETE_SUCCESS", requestId });
        } catch (err) {
            dispatch({
                type: "DELETE_ERROR",
                requestId,
                error: err instanceof Error ? err.message : "Delete failed"
            });
        }
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
        undoDelete,
        retryDelete,
        toggleItemSelection,
    };
}