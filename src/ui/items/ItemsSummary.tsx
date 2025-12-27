import { useItems } from "../../domain/items/items.context";

export function ItemsSummary() {
    const { state } = useItems();

    return (
        <section>
            <p>Status: {state.status}</p>
            <p>Number of items: {state.items.length}</p>
        </section>
    )
}