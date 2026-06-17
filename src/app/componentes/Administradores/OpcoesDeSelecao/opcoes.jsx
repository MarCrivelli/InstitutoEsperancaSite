const tipoAnimal = [
  { value: "cachorro", label: "Cachorro" },
  { value: "gato", label: "Gato" },
  { value: "ave", label: "Ave" },
  { value: "selvagem", label: "Animal selvagem" },
];

const idadeAnimais = [
  { value: "1", label: "1 ano" },
  { value: "2", label: "2 anos" },
  { value: "3", label: "3 anos" },
  { value: "4", label: "4 anos" },
  { value: "5", label: "5 anos" },
  { value: "6", label: "6 anos" },
  { value: "7", label: "7 anos" },
  { value: "8", label: "8 anos" },
  { value: "9", label: "9 anos" },
  { value: "10", label: "10 anos" },
  { value: "11", label: "11 anos" },
  { value: "12", label: "12 anos" },
  { value: "13", label: "13 anos" },
  { value: "14", label: "14 anos" },
  { value: "15", label: "15 anos" },
  { value: "16", label: "16 anos" },
  { value: "17", label: "17 anos" },
  { value: "18", label: "18 anos" },
  { value: "19", label: "19 anos" },
  { value: "20", label: "+20 anos" },
];

const sexoDoAnimal = [
  { value: "macho", label: "Macho" },
  { value: "femea", label: "Fêmea" },
];

const StatusVacinacao = [
  { value: "vacinado", label: "Vacinado" },
  { value: "naoVacinado", label: "Não vacinado" },
];

const DataVacinacao = [
  { value: "possuiData", label: "Possui data de vacinação" },
  { value: "naoPossuiData", label: "Não possui data de vacinação" },
];

const StatusCastracao = [
  { value: "castrado", label: "Castrado" },
  { value: "naoCastrado", label: "Não castrado" },
];

const StatusAdocao = [
  { value: "adotado", label: "Adotado" },
  { value: "naoAdotado", label: "Não adotado" },
  { value: "emObservacao", label: "Em observação" },
];

const StatusMicrochipagem = [
  { value: "microchipado", label: "Microchipado" },
  { value: "semMicrochip", label: "Sem microchip" },
];

const StatusVermifugacao = [
  { value: "estaComVerme", label: "Está com verme" },
  { value: "semVerme", label: "Sem Vermes" },
];

const descricoes = [
  { value: "descricao", label: "Descrição de entrada" },
  { value: "descricaoSaida", label: "Descrição de saída" },
];

// Função para obter o label a partir do value
export const vincularLabel = (value, optionType) => {
  if (!value) return "";

  const options = {
    tipoAnimal,
    idadeAnimais,
    sexoDoAnimal,
    StatusVacinacao,
    DataVacinacao,
    StatusCastracao,
    StatusAdocao,
    StatusMicrochipagem,
    StatusVermifugacao,
    descricoes,
  }[optionType];

  const found = options?.find((opt) => opt.value === value);
  return found?.label || value;
};

// Exportação padrão mantendo a compatibilidade
export default {
  tipoAnimal,
  idadeAnimais,
  sexoDoAnimal,
  StatusVacinacao,
  DataVacinacao,
  StatusCastracao,
  StatusAdocao,
  StatusMicrochipagem,
  StatusVermifugacao,
  descricoes,
  vincularLabel,
};
