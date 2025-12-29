import { useState } from "react";
import type { FormEvent } from "react";

type Props = {
    onAdd: (title: string) => void;
    onCancel?: () => void;
    disabled?: boolean;
}

export function NewItemForm({ onAdd, onCancel, disabled }: Props) {
    const [title, setTitle] = useState<string>('');
    const trimmed = title.trim();
    const canSubmit = !!trimmed && !disabled;
    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (!trimmed) return;

        onAdd(trimmed);
        setTitle('');
    }

    return (
        <form onSubmit={submit}>
            <label>
            New item title: {" "}
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={disabled}
                />
            </label>

            <button type="submit" disabled={!canSubmit}>
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