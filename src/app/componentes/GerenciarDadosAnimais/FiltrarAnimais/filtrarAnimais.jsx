function estaVacinacaoEmDia(animal) {
  if (!animal.dataVacinacao) {
    return animal.statusVacinacao === "vacinado";
  }

  const hoje = new Date();
  const umAnoAtras = new Date(hoje);
  umAnoAtras.setFullYear(hoje.getFullYear() - 1);

  return new Date(animal.dataVacinacao) >= umAnoAtras;
}

function estaVacinacaoVencidaOuAusente(animal) {
  if (!animal.dataVacinacao) {
    return animal.statusVacinacao === "naoVacinado";
  }

  const hoje = new Date();
  const umAnoAtras = new Date(hoje);
  umAnoAtras.setFullYear(hoje.getFullYear() - 1);

  return new Date(animal.dataVacinacao) < umAnoAtras;
}

function filtrarPorStatusVacinacao(animal, statusVacinacao = []) {
  if (!statusVacinacao.length) return true;

  const querVacinado = statusVacinacao.includes("vacinado");
  const querNaoVacinado = statusVacinacao.includes("naoVacinado");

  if (querVacinado && querNaoVacinado) return true;
  if (querVacinado) return estaVacinacaoEmDia(animal);
  if (querNaoVacinado) return estaVacinacaoVencidaOuAusente(animal);

  return true;
}

function filtrarPorDataVacinacao(animal, dataVacinacao = []) {
  if (!dataVacinacao.length) return true;

  const querPossuiData = dataVacinacao.includes("possuiData");
  const querNaoPossuiData = dataVacinacao.includes("naoPossuiData");

  if (querPossuiData && querNaoPossuiData) return true;
  if (querPossuiData) return !!animal.dataVacinacao;
  if (querNaoPossuiData) return !animal.dataVacinacao;

  return true;
}

function incluiEmLista(lista = [], valor) {
  return !lista.length || lista.includes(valor);
}

export function aplicarFiltrosAnimais(animais = [], filtros = {}) {
  return animais.filter((animal) => {
    const nomeMatch =
      !filtros.nome ||
      animal.nome?.toLowerCase().includes(filtros.nome.toLowerCase());

    const tipoMatch = incluiEmLista(filtros.tipo, animal.tipo);
    const idadeMatch = incluiEmLista(filtros.idade, animal.idade?.toString());
    const sexoMatch = incluiEmLista(filtros.sexo, animal.sexo);
    const microchipagemMatch = incluiEmLista(
      filtros.statusMicrochipagem,
      animal.statusMicrochipagem
    );
    const vacinacaoMatch = filtrarPorStatusVacinacao(
      animal,
      filtros.statusVacinacao
    );
    const dataVacinacaoMatch = filtrarPorDataVacinacao(
      animal,
      filtros.dataVacinacao
    );
    const castracaoMatch = incluiEmLista(
      filtros.statusCastracao,
      animal.statusCastracao
    );
    const adocaoMatch = incluiEmLista(
      filtros.statusAdocao,
      animal.statusAdocao
    );
    const vermifugacaoMatch = incluiEmLista(
      filtros.statusVermifugacao,
      animal.statusVermifugacao
    );

    const descricaoEntradaMatch = incluiEmLista(
      filtros.descricaoEntrada,
      animal.descricaoEntrada
    );

    const descricaoSaidaMatch = incluiEmLista(
      filtros.descricaoSaida,
      animal.descricaoSaida
    );

    return (
      nomeMatch &&
      tipoMatch &&
      idadeMatch &&
      sexoMatch &&
      microchipagemMatch &&
      vacinacaoMatch &&
      dataVacinacaoMatch &&
      castracaoMatch &&
      adocaoMatch &&
      vermifugacaoMatch &&
      descricaoEntradaMatch &&
      descricaoSaidaMatch
    );
  });
}

export function removerAnimaisPorCampos(
  animais = [],
  removerAnimaisQuePossuam = {}
) {
  return animais.filter((animal) => {
    return !Object.entries(removerAnimaisQuePossuam).some(([campo, valor]) => {
      if (valor === undefined || valor === null) {
        return false;
      }

      const valorAnimal = animal[campo];

      if (valor === "__vazio__") {
        return (
          valorAnimal === undefined ||
          valorAnimal === null ||
          String(valorAnimal).trim() === ""
        );
      }

      if (valor === "__nao_vazio__") {
        return !(
          valorAnimal === undefined ||
          valorAnimal === null ||
          String(valorAnimal).trim() === ""
        );
      }

      if (Array.isArray(valor)) {
        return valor.includes(valorAnimal);
      }

      return valorAnimal === valor;
    });
  });
}

export function existemFiltrosAtivos(filtros = {}) {
  return Object.values(filtros).some((valor) =>
    Array.isArray(valor) ? valor.length > 0 : valor !== ""
  );
}

export function criarFiltrosAnimaisPadrao() {
  return {
    tipo: [],
    idade: [],
    sexo: [],
    statusVacinacao: [],
    dataVacinacao: [],
    statusCastracao: [],
    statusAdocao: [],
    statusMicrochipagem: [],
    statusVermifugacao: [],
    nome: "",
    descricaoEntrada: "",
    descricaoSaida: "",
  };
}