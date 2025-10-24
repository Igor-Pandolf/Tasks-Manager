import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  #load() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  constructor() {
    this.#load();
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((item) => {
        return Object.entries(search).some(([key, value]) => {
          return item[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((item) => item.id === id);

    if (rowIndex > -1) {
      const oldData = this.#database[table][rowIndex];

      const updatedTask = {
        ...oldData,
        ...data,
        updated_at: new Date(),
      };

      this.#database[table][rowIndex] = updatedTask;
      this.#persist();

      return updatedTask;
    }

    return null;
  }

  updatedCompletedAt(table, id, completedAt) {
    const rowIndex = this.#database[table].findIndex((item) => item.id === id);

    if (rowIndex > -1) {
      const old = this.#database[table][rowIndex];

      const updated = {
        ...old,
        completed_at: completedAt,
        updated_at: new Date(),
      };

      this.#database[table][rowIndex] = updated;
      this.#persist();

      return updated;
    }

    return null;
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((item) => item.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
      return true;
    }

    return false;
  }
}
