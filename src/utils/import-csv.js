import fs from "node:fs";
import { parse } from "csv-parse";

const csvFilePath = new URL("../../tasks.csv", import.meta.url);

const tasksUrl = "http://localhost:3333/tasks";

// 1. Cria um stream de leitura do arquivo CSV
const stream = fs.createReadStream(csvFilePath);

// 2. Cria o "parser" do CSV
//    - `columns: true` diz ao parser para usar a primeira linha (title,description)
//      como as chaves para os objetos.
//    - `from_line: 2` pula a primeira linha (cabeçalho) dos dados,
//      processando apenas da linha 2 em diante.
const parser = parse({
  columns: true,
  from_line: 1,
});

// 3. Função assíncrona para processar o stream
async function processCsv() {
  console.log("Iniciando importação de tarefas...");

  // 4. Conecta o stream de leitura ao parser
  //    Isso lê o arquivo e o transforma em objetos.
  const records = stream.pipe(parser);

  // 5. Itera sobre cada "record" (linha) que o parser emite
  //    Usar `for await...of` é ótimo pois ele lida com o stream
  //    e espera cada `await` interno (o fetch) terminar.
  for await (const task of records) {
    // `task` será um objeto como:
    // { title: 'Task 01', description: 'Descrição da Task 01' }

    try {
      const response = await fetch(tasksUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });

      if (response.ok) {
        console.log(`[SUCESSO] Tarefa "${task.title}" importada.`);
      } else {
        const errorBody = await response.text();

        console.error(
          `[FALHA] Tarefa "${task.title}". Status: ${response.status}. Resposta: ${errorBody}`
        );
      }
    } catch (error) {
      console.error(
        `[ERRO] Falha na requisição para a tarefa "${task.title}": ${error.message}`
      );
    }
  }

  console.log("--- Importação finalizada ---");
}

// 6. Executa a função
processCsv();
