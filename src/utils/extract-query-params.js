export function extractQueryParams(query) {
  return query
    .substr(1) // Remove o "?"
    .split("&") // Separa os parâmetros (ex: ['title=a', 'desc=b'])
    .reduce((queryParams, param) => {
      const [key, value] = param.split("="); // Separa chave e valor

      // Nós decodificamos o valor para transformar %20 em espaço, etc.
      queryParams[key] = decodeURIComponent(value);

      return queryParams;
    }, {});
}
