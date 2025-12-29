import { useItems } from "../../domain/items/items.context";
import {
    canUndoDelete,
    canRetryDelete,
    deleteCount
} from "../../domain/items/items.selectors";

export function DeleteBanner() {
    const { state, effects } = useItems();

    if (state.status !== "ready") return null;

    const del = state.delete;
    if (del.kind === "idle") return null;

    const count = deleteCount(state);
    const requestId = del.requestId;

    return (
        <div style={{ padding: 8, background: "#eee", marginTop: 8 }}>
            {count && (
                <span>Deleting {count}  items...</span>
            )}

            {canRetryDelete(state) && (
                <>
                    <span>Delete failed.</span>{" "}
                    <button onClick={() =>
                        effects.retryDelete(
                            requestId,
                            del.snapshot.map(item => item.id)
                        )
                    }>
                        Retry
                    </button>{" "}
                </>
            )}
            
            {
                canUndoDelete(state) && (
                    <button onClick={() => effects.undoDelete(requestId)}>
                        Undo
                    </button>
                )
            }
        </div >
    )
}
