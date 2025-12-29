import type { FormEvent } from "react";

type Props = {
    onDelete: () => void;
    onCancel?: () => void;
    disabled?: boolean
}

export function DeleteForm({ onDelete, onCancel, disabled }: Props) {
    const submit = (e: FormEvent) => {
        e.preventDefault();

        onDelete();
    }

    return (
        <form onSubmit={submit}>
            <p>Are you sure you want to delete the selected items?</p>
            <button type="submit" disabled={disabled}>
                Delete
            </button>
            {onCancel && (
                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            )}
        </form>
    )
}