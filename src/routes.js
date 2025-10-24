import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const hasQuery = Object.keys(req.query).length > 0;

      const tasks = database.select("tasks", hasQuery ? req.query : null);

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert("tasks", task);

      return res.writeHead(201).end(JSON.stringify(task));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const updatedTask = database.update("tasks", id, {
        title,
        description,
      });

      if (updatedTask) {
        return res.end(JSON.stringify(updatedTask));
      } else {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: "Task not found." }));
      }
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const task = database.select("tasks", { id })[0];
      let updatedTask;

      if (task.completed_at === null) {
        updatedTask = database.updatedCompletedAt("tasks", id, new Date());
      } else {
        updatedTask = database.updatedCompletedAt("tasks", id, null);
      }

      if (updatedTask) {
        return res.end(JSON.stringify(updatedTask));
      } else {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: "Task not found." }));
      }
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const deletedTask = database.delete("tasks", id);

      if (deletedTask) {
        return res.writeHead(204).end();
      } else {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: "Task not found." }));
      }
    },
  },
];
