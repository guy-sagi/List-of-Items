import { Item } from "../../domain/items/items.types";

type Props = {
    items: Item[];
    onChecked: (id: string, checked: boolean) => void;
    disabled: boolean;
}

export function ItemsList({ items, onChecked, disabled }: Props) {
    return (
        <>
            {items.length === 0 ? (
                <p>No items</p>
            ) : (
                <ul>
                    {items.map(item => (
                        <li key={item.id}>
                            <input
                                type="checkbox"
                                onChange={e => onChecked(item.id, e.target.checked)}
                                checked={item.selected}
                                disabled={disabled}
                            />
                            <p>{item.title}</p>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}