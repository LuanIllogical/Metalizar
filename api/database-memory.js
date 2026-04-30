import { randomUUID } from "node:crypto";

export class DatabaseMemory {
    orders = new Map();

    list() {
        return Array.from(this.orders.entries()).map(([id, data]) => ({
            id,
            ...data
        }));
    }

    create(order) {
        const id = randomUUID();
        this.orders.set(id, order);
        return id;
    }

    update(id, order) {
        this.orders.set(id, order);
    }

    delete(id) {
        this.orders.delete(id);
    }
}