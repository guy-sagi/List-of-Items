import { useState } from "react";

type Props = {
    onAdd: (title: string) => void;
    onCancel?: () => void;
    disabled?: boolean;
}

export function NewItemForm({ onAdd, onCancel, disabled }: Props) {
    const [title, setTitle] = useState<string>('');
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;

        onAdd(trimmed);
        setTitle('');
    }

    return (
        <form onSubmit={submit}>
            <input
                type="text"
                value={title}
                placeholder="New item title"
                onChange={e => setTitle(e.target.value)}
                disabled={disabled}
            />

            <button type="submit" disabled={disabled || !title.trim()}>
                Add
            </button>
            {onCancel && (
                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            )}
        </form>
    )
}