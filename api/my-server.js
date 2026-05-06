import { fastify } from 'fastify';
import cors from '@fastify/cors';
import { DatabasePostgres } from './database-postgres.js';

const server = fastify();

await server.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

const database = new DatabasePostgres();

server.post("/orders", async (request, reply) => {
  const { items, address, total, date } = request.body;

  const id = await database.create({
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

server.get("/orders", async (request, reply) => {
  const orders = await database.list();
  return reply.status(200).send(orders);
});

server.put("/orders/:id", async (request, reply) => {
  const { id } = request.params;
  const { items, address, total } = request.body;

  await database.update(id, { items, address, total });

  return reply.status(200).send({
    message: "Pedido atualizado com sucesso!"
  });
});

server.delete("/orders/:id", async (request, reply) => {
  const { id } = request.params;

  await database.delete(id);

  return reply.status(200).send({
    message: "Pedido excluído com sucesso!"
  });
});

server.listen({ port: 3333 });