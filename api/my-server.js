import { fastify } from 'fastify';
import cors from '@fastify/cors';
import { DatabaseMemory } from './database-memory.js';

const server = fastify();

await server.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

const database = new DatabaseMemory();

// CREATE ORDER
server.post("/orders", (request, reply) => {
  const { items, address, total, date } = request.body;

  const id = database.create({
    items,
    address,
    total,
    date
  });

  return reply.status(201).send({
    message: "Pedido criado com sucesso!",
    id
  });
});

// GET ALL ORDERS
server.get("/orders", (request, reply) => {
  const orders = database.list();
  return reply.status(200).send(orders);
});

// UPDATE ORDER
server.put("/orders/:id", (request, reply) => {
  const { id } = request.params;
  const { items, address, total } = request.body;

  database.update(id, { items, address, total });

  return reply.status(200).send({
    message: "Pedido atualizado com sucesso!"
  });
});

// DELETE ORDER
server.delete("/orders/:id", (request, reply) => {
  const { id } = request.params;

  database.delete(id);

  return reply.status(200).send({
    message: "Pedido excluído com sucesso!"
  });
});

server.listen({ port: 3333 });