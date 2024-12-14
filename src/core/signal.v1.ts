type Listener<T> = (value: T) => void;
/**
 * A class representing a reactive signal that holds a value and notifies listeners of changes.
 */
export class Signal<T> {
    private value: T;
    private listeners: Set<Listener<T>>;

    /**
     * Initializes the signal with an initial value.
     * @param initialValue - The initial value of the signal.
     */
    constructor(initialValue: T) {
        this.value = initialValue;
        this.listeners = new Set();
    }

    /**
     * Gets the current value of the signal.
     * @returns The current value.
     */
    get get(): T {
        return this.value;
    }

    /**
     * Updates the value and notifies listeners if the value changes.
     * @param newValue - The new value or a function that returns the new value.
     */
    set(newValue: T | ((oldValue: T) => T)): void {
        if (typeof newValue === 'function') {
            newValue = (newValue as (oldValue: T) => T)(this.value);
        }

        if (this.value !== newValue) {
            this.value = newValue;
            this.notify();
        }
    }

    /**
     * Subscribes a listener to changes in the signal.
     * @param listener - The listener to be notified of changes.
     * @returns An unsubscribe function to remove the listener.
     */
    subscribe(listener: Listener<T>): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Notifies all subscribed listeners about a change in the signal.
     */
    private notify(): void {
        this.listeners.forEach((listener) => listener(this.value));
    }
}

/**
 * Creates a new signal with an initial value.
 * @param initialValue - The initial value of the signal.
 * @returns A new Signal instance.
 */
export function signal<T>(initialValue: T): Signal<T> {
    return new Signal(initialValue);
}
