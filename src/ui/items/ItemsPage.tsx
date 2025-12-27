import { useState, useEffect } from "react";
import { useItems } from "../../domain/items/items.context";
import { ItemsList } from "./ItemsList";
import { NewItemForm } from "./NewItemForm";
import { DeleteForm } from "./DeleteForm";
import { ItemsSummary } from "./ItemsSummary";
import {
    isReady,
    isCreating,
    createError,
    isDeleting,
    deleteError,
    selectedItems
} from "../../domain/items/items.selectors";

export function ItemsPage() {
    const { state, effects } = useItems();
    const [isNewItemFormOpen, setIsNewItemFormOpen] = useState<boolean>(false);
    const [isDeleteItemsFormOpen, setIsDeleteItemsFormOpen] = useState<boolean>(false);
    const ready = isReady(state);
    const creating = isCreating(state);
    const cError = createError(state);
    const deleting = isDeleting(state);
    const dError = deleteError(state);
    const selected = selectedItems(state);
    const canDelete = selected.length > 0 && !deleting;

    useEffect(() => {
        effects.loadItems();
    }, [effects]);

    useEffect(() => {
        if (ready && !creating && !cError) {
            setIsNewItemFormOpen(false);
        }
    }, [ready, creating, cError])

    useEffect(() => {
        if (ready && !deleting && !deleteError) {
            setIsDeleteItemsFormOpen(false);
        }
    }, [ready, deleting, deleteError])

    return (
        <div>
            <h1>Items</h1>

            {state.status === "loading" && <p>Loading...</p>}
            {state.status === "error" && <p>{state.error}</p>}

            <ItemsSummary />
            <ItemsList
                items={state.items}
                onChecked={(id, selected) => {
                    effects.toggleItemSelection(id, selected)
                }}
                disabled={!canDelete}
            />

            <button onClick={() => setIsNewItemFormOpen(true)}>
                Add Item
            </button>
            <button
                onClick={() => setIsDeleteItemsFormOpen(true)}
                disabled={!canDelete}
            >
                Delete
            </button>

            {isNewItemFormOpen && (
                <>
                    <NewItemForm
                        onAdd={(title) => {
                            effects.addItem(title)
                        }}
                        onCancel={() => setIsNewItemFormOpen(false)}
                        disabled={isCreating(state)}
                    />

                    {cError && (
                        <p>{cError}</p>
                    )}
                </>
            )}
            {isDeleteItemsFormOpen && (
                <>
                    <DeleteForm
                        onDelete={() => {
                            effects.deleteItems(selectedItems(state))
                        }}
                        onCancel={() => setIsDeleteItemsFormOpen(false)}
                        disabled={isDeleting(state)}
                    />

                    {dError && (
                        <p>{dError}</p>
                    )}
                </>
            )}
        </div>
    )
}