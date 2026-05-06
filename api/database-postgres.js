import { randomUUID } from "node:crypto";
import { pool } from "./database.js";

export class DatabasePostgres {

    async list() {
        const result = await pool.query('SELECT * FROM orders');
        return result.rows;
    }

    async create(order) {
        const id = randomUUID();

        await pool.query(
            'INSERT INTO orders (id, items, address, total, date) VALUES ($1, $2, $3, $4, $5)',
            [id, JSON.stringify(order.items), order.address, order.total, order.date]
        );

        return id;
    }

    async update(id, order) {
        await pool.query(
            'UPDATE orders SET items=$1, address=$2, total=$3 WHERE id=$4',
            [JSON.stringify(order.items), order.address, order.total, id]
        );
    }

    async delete(id) {
        await pool.query(
            'DELETE FROM orders WHERE id=$1',
            [id]
        );
    }
}