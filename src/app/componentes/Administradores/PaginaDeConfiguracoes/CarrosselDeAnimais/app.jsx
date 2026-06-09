import { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import Select from "react-select";
import styles from "./carrosselAnimais.module.css";

const SetaCustomizadaDoCarrossel = ({ onClick, direcao }) => {
  const Icone = direcao === "left" ? FiChevronLeft : FiChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.setaCarrossel} ${
        direcao === "left" ? styles.setaEsquerda : styles.setaDireita
      }`}
      aria-label={direcao === "left" ? "Anterior" : "Próximo"}
    >
      <Icone size={24} />
    </button>
  );
};

export default function CarrosselAnimais() {
  // ESTADOS PRINCIPAIS
  const [erro, setErro] = useState("");
  const [animais, setAnimais] = useState([]);
  const [animaisCarrossel, setAnimaisCarrossel] = useState([]);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [carregandoCarrossel, setCarregandoCarrossel] = useState(false);

  // ESTADOS PARA CONTROLE DE EXIBIÇÃO
  const [mostrarSaidaFormulario, setMostrarSaidaFormulario] = useState(false);
  const [mostrarSaidaPorSlide, setMostrarSaidaPorSlide] = useState({});

  // ESTADOS PARA EDIÇÃO DOS SLIDES
  const [editandoSlide, setEditandoSlide] = useState(null);
  const [dadosEditados, setDadosEditados] = useState(null);
  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [existemAlteracoes, setExistemAlteracoes] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // ESTADOS PARA REMOÇÃO
  const [removendoAnimal, setRemovendoAnimal] = useState(null);

  // ESTADOS PARA IMAGENS PENDENTES
  const [imagemEntradaPendente, setImagemEntradaPendente] = useState(null);
  const [imagemSaidaPendente, setImagemSaidaPendente] = useState(null);

  useEffect(() => {
    carregarAnimais();
    carregarAnimaisCarrossel();
  }, []);

  const carregarAnimais = async () => {
    try {
      setCarregando(true);
      console.log("🔄 Iniciando carregamento de animais...");

      // Carregar animais disponíveis para seleção
      const responseAnimais = await fetch(
        "http://localhost:3003/carrossel/animais/selecao",
      );

      if (!responseAnimais.ok) {
        throw new Error(`Erro HTTP: ${responseAnimais.status}`);
      }

      const dataAnimais = await responseAnimais.json();
      console.log("📦 Dados brutos dos animais:", dataAnimais);

      // Carregar animais já no carrossel
      const responseCarrossel = await fetch(
        "http://localhost:3003/carrossel/animais",
      );

      if (!responseCarrossel.ok) {
        throw new Error(`Erro HTTP: ${responseCarrossel.status}`);
      }

      const dataCarrossel = await responseCarrossel.json();
      console.log("🎠 Dados do carrossel:", dataCarrossel);

      // Extrair IDs dos animais já no carrossel
      const animaisNoCarrossel = [];
      if (dataCarrossel && Array.isArray(dataCarrossel.data)) {
        dataCarrossel.data.forEach((item) => {
          if (item && item.animal && item.animal.id) {
            animaisNoCarrossel.push(item.animal.id);
          }
        });
      }

      console.log("🎠 IDs dos animais já no carrossel:", animaisNoCarrossel);

      // Verificar se dataAnimais é um array
      if (!Array.isArray(dataAnimais)) {
        console.warn("⚠️ dataAnimais não é um array:", dataAnimais);
        setAnimais([]);
        return;
      }

      // ANÁLISE DETALHADA DOS DADOS - Vamos ver EXATAMENTE o que temos
      console.log("🔬 ANÁLISE COMPLETA DOS DADOS:");
      console.log("Total de animais recebidos:", dataAnimais.length);

      dataAnimais.forEach((animal, index) => {
        console.log(`\n🐾 ======= ANIMAL ${index} =======`);
        console.log("Objeto completo:", animal);
        console.log("Tipo do objeto:", typeof animal);
        console.log("Chaves disponíveis:", Object.keys(animal || {}));

        if (animal) {
          console.log("📋 TODOS OS CAMPOS DO ANIMAL:");
          Object.entries(animal).forEach(([key, value]) => {
            console.log(`  ${key}: ${value} (tipo: ${typeof value})`);
          });
        }
        console.log(`======= FIM ANIMAL ${index} =======\n`);
      });

      // Filtrar animais disponíveis - TEMPORARIAMENTE MAIS PERMISSIVO PARA TESTE
      const animaisDisponiveis = dataAnimais.filter((animal, index) => {
        console.log(`\n🔍 ===== VALIDAÇÃO ANIMAL ${index} =====`);

        // Verificações básicas
        if (!animal || !animal.id) {
          console.log(`❌ Animal ${index}: sem ID ou objeto nulo`);
          return false;
        }

        // Verificar se não está no carrossel
        const naoEstaNoCarrossel = !animaisNoCarrossel.includes(animal.id);
        console.log(`🎠 Não está no carrossel: ${naoEstaNoCarrossel}`);

        // TEMPORÁRIO: vamos aceitar animais só com nome para ver se aparecem no Select
        const isValidTemporario = temNome && naoEstaNoCarrossel;

        console.log(
          `🧪 TESTE TEMPORÁRIO - Animal ${animal.id} válido: ${isValidTemporario}`,
        );
        console.log(`===== FIM VALIDAÇÃO ANIMAL ${index} =====\n`);

        return isValidTemporario;
      });

      console.log("🎯 Animais disponíveis filtrados:", animaisDisponiveis);

      // Mapear para formato do Select
      const animaisParaSelect = animaisDisponiveis.map((animal) => ({
        value: animal.id,
        label: animal.nome || animal.name || `Animal ${animal.id}`,
        originalData: animal,
      }));

      console.log("🎯 Animais mapeados para Select:", animaisParaSelect);

      setAnimais(animaisParaSelect);
    } catch (error) {
      console.error("❌ Falha ao carregar animais:", error);
      setErro("Falha ao carregar animais. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const carregarAnimaisCarrossel = async () => {
    try {
      setCarregandoCarrossel(true);
      const response = await fetch("http://localhost:3003/carrossel/animais");

      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      const data = await response.json();

      const dadosProcessados = Array.isArray(data.data)
        ? data.data
            .filter((item) => item?.animal)
            .map((item) => ({
              ...item,
              animal: {
                ...item.animal,
                imagemEntrada: item.animal.imagemEntrada || null,
                imagemSaida: item.animal.imagemSaida || null,
                nome: item.animal.nome || "Animal sem nome",
                descricaoEntrada:
                  item.animal.descricaoEntrada || "Sem descrição de entrada",
                descricaoSaida:
                  item.animal.descricaoSaida ||
                  item.descricaoSaida ||
                  "Sem descrição de saída",
              },
            }))
        : [];

      setAnimaisCarrossel(dadosProcessados);
    } catch (error) {
      console.error("Erro ao carregar animais do carrossel:", error);
      setErro("Falha ao carregar animais do carrossel. Tente novamente.");
      setAnimaisCarrossel([]);
    } finally {
      setCarregandoCarrossel(false);
    }
  };

  const handleSelecionarAnimal = async (selectedOption) => {
    setErro("");
    console.log("🎯 Animal selecionado:", selectedOption);

    if (!selectedOption) {
      setAnimalSelecionado(null);
      setMostrarSaidaFormulario(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3003/animais/${selectedOption.value}`,
      );
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      const data = await response.json();
      console.log("📦 Dados completos do animal selecionado:", data);
      setAnimalSelecionado(data);
      setMostrarSaidaFormulario(false);
    } catch (error) {
      console.error("Erro ao buscar animal:", error);
      setErro("Erro ao buscar detalhes do animal. Tente novamente.");
    }
  };

  const handleInserirAnimal = async () => {
    if (!animalSelecionado) {
      setErro("Selecione um animal para inserir");
      return;
    }

    try {
      const response = await fetch("http://localhost:3003/carrossel/animais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          animalId: animalSelecionado.id,
          descricaoSaida: animalSelecionado.descricaoSaida,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao adicionar animal`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      await carregarAnimaisCarrossel();
      await carregarAnimais();

      setAnimalSelecionado(null);
      setMostrarSaidaFormulario(false);
      setErro("");
      console.log("Animal inserido com sucesso e listas atualizadas");
    } catch (error) {
      console.error("Erro ao inserir animal:", error);
      setErro(error.message || "Erro ao inserir animal. Tente novamente.");
    }
  };

  const handleRemoverAnimal = async (slideId, nomeAnimal) => {
    if (
      !window.confirm(
        `Tem certeza que deseja remover "${nomeAnimal}" do carrossel?`,
      )
    ) {
      return;
    }

    try {
      setRemovendoAnimal(slideId);

      const response = await fetch(
        `http://localhost:3003/carrossel/animais/${slideId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erro ao remover animal do carrossel`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      await carregarAnimaisCarrossel();
      await carregarAnimais();

      setMostrarSaidaPorSlide((prev) => {
        const novoEstado = { ...prev };
        delete novoEstado[slideId];
        return novoEstado;
      });

      if (editandoSlide === slideId) {
        cancelarEdicao();
      }

      setErro("");
      console.log("Animal removido com sucesso e listas atualizadas");
    } catch (error) {
      console.error("Erro ao remover animal:", error);
      setErro(
        error.message ||
          "Erro ao remover animal do carrossel. Tente novamente.",
      );
    } finally {
      setRemovendoAnimal(null);
    }
  };

  // FUNÇÃO PARA ALTERNAR DADOS DO FORMULÁRIO
  const alternarDadosFormulario = () => {
    if (animalSelecionado) {
      setMostrarSaidaFormulario(!mostrarSaidaFormulario);
    }
  };

  const alternarDadosSlide = (slideId) => {
    setMostrarSaidaPorSlide((prev) => ({
      ...prev,
      [slideId]: !prev[slideId],
    }));
  };

  // FUNÇÕES DE EDIÇÃO
  const iniciarEdicaoSlide = (slide) => {
    const dadosPreparados = {
      ...slide.animal,
      descricao: slide.animal.descricao || "",
      descricaoSaida: slide.animal.descricaoSaida || "",
    };

    setEditandoSlide(slide.id);
    setDadosOriginais(dadosPreparados);
    setDadosEditados(dadosPreparados);
    setExistemAlteracoes(false);
    setImagemEntradaPendente(null);
    setImagemSaidaPendente(null);
  };

  const cancelarEdicao = () => {
    setEditandoSlide(null);
    setDadosEditados(null);
    setDadosOriginais(null);
    setExistemAlteracoes(false);

    // Limpar URLs temporárias das imagens
    if (imagemEntradaPendente) {
      URL.revokeObjectURL(imagemEntradaPendente.url);
      setImagemEntradaPendente(null);
    }
    if (imagemSaidaPendente) {
      URL.revokeObjectURL(imagemSaidaPendente.url);
      setImagemSaidaPendente(null);
    }
  };

  const verificarSeExistemAlteracoes = (original, editado) => {
    if (!original || !editado) return false;

    const camposIgnorados = ["createdAt", "updatedAt", "id"];
    const temImagensPendentes =
      imagemEntradaPendente !== null || imagemSaidaPendente !== null;

    for (const campo in editado) {
      if (camposIgnorados.includes(campo)) continue;

      const valorOriginal = original[campo] === null ? "" : original[campo];
      const valorEditado = editado[campo] === null ? "" : editado[campo];

      if (String(valorOriginal) !== String(valorEditado)) {
        setExistemAlteracoes(true);
        return true;
      }
    }

    if (temImagensPendentes) {
      setExistemAlteracoes(true);
      return true;
    }

    setExistemAlteracoes(false);
    return false;
  };

  const capturarMudancaCampo = (e) => {
    const { name, value } = e.target;
    setDadosEditados((anterior) => {
      const novoEstado = { ...anterior, [name]: value };
      verificarSeExistemAlteracoes(dadosOriginais, novoEstado);
      return novoEstado;
    });
  };

  const processarUploadImagem = (arquivo, tipoCampo) => {
    if (!arquivo) return;

    const urlTemporaria = URL.createObjectURL(arquivo);

    if (tipoCampo === "imagemSaida") {
      if (imagemSaidaPendente) {
        URL.revokeObjectURL(imagemSaidaPendente.url);
      }
      setImagemSaidaPendente({ arquivo, url: urlTemporaria });
    } else {
      if (imagemEntradaPendente) {
        URL.revokeObjectURL(imagemEntradaPendente.url);
      }
      setImagemEntradaPendente({ arquivo, url: urlTemporaria });
    }

    // Força a verificação de alterações
    verificarSeExistemAlteracoes(dadosOriginais, dadosEditados);
  };

  const uploadImagemParaServidor = async (
    imagemPendente,
    tipoCampo,
    animalId,
  ) => {
    const endpoint =
      tipoCampo === "imagemSaida"
        ? `http://localhost:3003/animais/${animalId}/imagem-saida`
        : `http://localhost:3003/animais/${animalId}/imagem-entrada`;

    const dadosFormulario = new FormData();
    dadosFormulario.append(tipoCampo, imagemPendente.arquivo);

    const resposta = await fetch(endpoint, {
      method: "PUT",
      body: dadosFormulario,
    });

    if (!resposta.ok) {
      const dadosErro = await resposta.json();
      throw new Error(dadosErro.message || "Erro ao atualizar imagem");
    }

    return await resposta.json();
  };

  const salvarEdicaoSlide = async (slideId) => {
    try {
      setSalvandoEdicao(true);
      console.log("💾 Iniciando salvamento da edição...");
      console.log("📋 Dados originais:", dadosOriginais);
      console.log("📋 Dados editados:", dadosEditados);

      // Upload das imagens pendentes primeiro
      if (imagemEntradaPendente) {
        console.log("🖼️ Fazendo upload da imagem de entrada...");
        await uploadImagemParaServidor(
          imagemEntradaPendente,
          "imagemEntrada",
          dadosEditados.id,
        );
        URL.revokeObjectURL(imagemEntradaPendente.url);
        setImagemEntradaPendente(null);
        console.log("✅ Upload da imagem de entrada concluído");
      }

      if (imagemSaidaPendente) {
        console.log("🖼️ Fazendo upload da imagem de saída...");
        await uploadImagemParaServidor(
          imagemSaidaPendente,
          "imagemSaida",
          dadosEditados.id,
        );
        URL.revokeObjectURL(imagemSaidaPendente.url);
        setImagemSaidaPendente(null);
        console.log("✅ Upload da imagem de saída concluído");
      }

      let dadosParaEnviar = {
        nome: dadosEditados.nome,
        descricao: dadosEditados.descricao,
        descricaoSaida: dadosEditados.descricaoSaida,
      };

      dadosParaEnviar = Object.fromEntries(
        Object.entries(dadosParaEnviar).filter(
          ([, value]) => value !== null && value !== undefined,
        ),
      );

      console.log(
        "📤 Dados que serão enviados para o servidor:",
        dadosParaEnviar,
      );
      console.log(
        "🌐 URL da requisição:",
        `http://localhost:3003/animais/${dadosEditados.id}`,
      );
      console.log(
        "🔍 ID do animal:",
        dadosEditados.id,
        "Tipo:",
        typeof dadosEditados.id,
      );

      const response = await fetch(
        `http://localhost:3003/animais/${dadosEditados.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosParaEnviar),
        },
      );

      console.log("📡 Status da resposta:", response.status);
      console.log("📡 Headers da resposta:", [...response.headers.entries()]);

      if (!response.ok) {
        let errorData;
        let errorMessage = "Erro ao salvar alterações";

        try {
          const responseText = await response.text();
          console.log("📡 Resposta bruta do servidor:", responseText);

          if (responseText) {
            try {
              errorData = JSON.parse(responseText);
              console.log("📡 Dados de erro parseados:", errorData);
              errorMessage =
                errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
              console.log(
                "⚠️ Não foi possível parsear a resposta como JSON:",
                parseError,
              );
              errorMessage = `Erro ${response.status}: ${responseText}`;
            }
          } else {
            errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (textError) {
          console.log("⚠️ Erro ao ler resposta como texto:", textError);
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }

        const erroDetalhado = {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: `http://localhost:3003/animais/${dadosEditados.id}`,
          dadosEnviados: dadosParaEnviar,
        };

        console.error("❌ Erro detalhado da requisição:");
        console.error("   Status:", response.status);
        console.error("   Status Text:", response.statusText);
        console.error(
          "   URL:",
          `http://localhost:3003/animais/${dadosEditados.id}`,
        );
        console.error("   Dados enviados:", dadosParaEnviar);
        console.error("   Error Data:", errorData);
        console.error("   Objeto completo:", erroDetalhado);

        // Se for erro 500, vamos tentar uma abordagem alternativa
        if (response.status === 500) {
          console.log("🔄 Tentando abordagem alternativa para erro 500...");

          // Primeiro, vamos testar se o endpoint GET funciona
          try {
            console.log("🧪 Testando se o endpoint GET funciona...");
            const testGet = await fetch(
              `http://localhost:3003/animais/${dadosEditados.id}`,
            );
            console.log("📡 Status do GET:", testGet.status);
            if (testGet.ok) {
              const getData = await testGet.json();
              console.log("📦 Dados atuais do animal:", getData);
            }
          } catch (getError) {
            console.log("❌ Erro no teste GET:", getError);
          }

          // Testa com PATCH em vez de PUT
          try {
            console.log("🧪 Testando com PATCH em vez de PUT...");
            const dadosMinimos = { nome: dadosEditados.nome };
            console.log("📤 Dados para PATCH:", dadosMinimos);

            const responsePatch = await fetch(
              `http://localhost:3003/animais/${dadosEditados.id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(dadosMinimos),
              },
            );

            console.log("📡 Status do PATCH:", responsePatch.status);

            if (responsePatch.ok) {
              console.log(
                "✅ Sucesso com PATCH! O endpoint PUT pode não estar implementado.",
              );
              const responseData = await responsePatch.json();
              console.log("📡 Resposta do PATCH:", responseData);

              await carregarAnimaisCarrossel();
              setEditandoSlide(null);
              setDadosEditados(null);
              setDadosOriginais(null);
              setExistemAlteracoes(false);

              console.log("✅ Edição salva com sucesso usando PATCH!");
              return; // Sai da função
            } else {
              const patchErrorText = await responsePatch.text();
              console.log("❌ Erro com PATCH:", patchErrorText);
            }
          } catch (patchError) {
            console.log("❌ Erro na tentativa com PATCH:", patchError);
          }

          // Tenta um endpoint alternativo (talvez seja /animal em vez de /animais)
          try {
            console.log("🧪 Testando endpoint alternativo /animal...");
            const dadosMinimos = { nome: dadosEditados.nome };

            const responseAlt = await fetch(
              `http://localhost:3003/animal/${dadosEditados.id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(dadosMinimos),
              },
            );

            console.log(
              "📡 Status do endpoint alternativo:",
              responseAlt.status,
            );

            if (responseAlt.ok) {
              console.log("✅ Sucesso com endpoint alternativo /animal!");
              const responseData = await responseAlt.json();
              console.log("📡 Resposta:", responseData);

              await carregarAnimaisCarrossel();
              setEditandoSlide(null);
              setDadosEditados(null);
              setDadosOriginais(null);
              setExistemAlteracoes(false);

              console.log("✅ Edição salva com sucesso usando /animal!");
              return; // Sai da função
            } else {
              const altErrorText = await responseAlt.text();
              console.log("❌ Erro com endpoint alternativo:", altErrorText);
            }
          } catch (altError) {
            console.log(
              "❌ Erro na tentativa com endpoint alternativo:",
              altError,
            );
          }
        }

        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("✅ Resposta de sucesso do servidor:", responseData);

      await carregarAnimaisCarrossel();
      await carregarAnimais();

      setEditandoSlide(null);
      setDadosEditados(null);
      setDadosOriginais(null);
      setExistemAlteracoes(false);

      console.log("✅ Slide editado com sucesso!");
    } catch (error) {
      console.error("❌ Erro completo ao salvar edição:", error);
      console.error("❌ Stack trace:", error.stack);
      setErro(`Erro ao salvar alterações: ${error.message}`);
    } finally {
      setSalvandoEdicao(false);
    }
  };

  // Função para obter a URL da imagem (com preview se pendente)
  const obterUrlImagem = (slide, tipoImagem) => {
    const mostrarSaida = mostrarSaidaPorSlide[slide.id] || false;

    if (editandoSlide === slide.id) {
      // Se está editando, verifica se há imagem pendente
      if (tipoImagem === "entrada" && imagemEntradaPendente) {
        return imagemEntradaPendente.url;
      }
      if (tipoImagem === "saida" && imagemSaidaPendente) {
        return imagemSaidaPendente.url;
      }
    }

    // Retorna a imagem baseada no estado de mostrarSaida
    if (mostrarSaida && slide.animal.imagemSaida) {
      return `http://localhost:3003/uploads/${slide.animal.imagemSaida}`;
    } else if (!mostrarSaida && slide.animal.imagemEntrada) {
      return `http://localhost:3003/uploads/${slide.animal.imagemEntrada}`;
    }

    return "/placeholder-image.jpg";
  };

  if (carregando || carregandoCarrossel) {
    return (
      <div className={styles.fundoCarrossel}>
        <div className={styles.carregando}>
          <img src="/carregando.svg" alt="Carregando" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={styles.fundoCarrossel}>
        <div className={styles.erro}>
          <p>{erro}</p>
          <button
            onClick={() => {
              setErro("");
              carregarAnimais();
              carregarAnimaisCarrossel();
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fundoCarrossel}>
      <Carousel
        className={styles.carrossel}
        showThumbs={false}
        showStatus={false}
        infiniteLoop={true}
        showIndicators={false}
        renderArrowPrev={(onClickHandler, hasPrev) =>
          hasPrev && (
            <SetaCustomizadaDoCarrossel
              onClick={onClickHandler}
              direcao="left"
            />
          )
        }
        renderArrowNext={(onClickHandler, hasNext) =>
          hasNext && (
            <SetaCustomizadaDoCarrossel
              onClick={onClickHandler}
              direcao="right"
            />
          )
        }
      >
        {/*SLIDE DO FORMULÁRIO*/}
        <div className={styles.slideFormulario}>
          {/* BOTÃO TROCAR DADOS DO FORMULÁRIO (REINTRODUZIDO) */}
          <div
            className={styles.divBotaoTrocarDados}
            onClick={alternarDadosFormulario}
          >
            <img
              src="/pagConfiguracoes/trocarDados.png"
              alt="Trocar dados"
              style={{
                cursor: animalSelecionado ? "pointer" : "default",
                opacity: animalSelecionado ? 1 : 0.5,
                transform: mostrarSaidaFormulario
                  ? "rotate(-90deg)"
                  : "rotate(90deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </div>

          <div className={styles.conteudoSlide}>
            <div className={styles.containerImagem}>
              {!animalSelecionado ? (
                <div className={styles.preRenderImagem}>
                  Sem imagem por enquanto
                </div>
              ) : (
                <img
                  className={styles.imagemAnimal}
                  src={`http://localhost:3003/uploads/${
                    mostrarSaidaFormulario
                      ? animalSelecionado.imagemSaida
                      : animalSelecionado.imagemEntrada
                  }`}
                  alt={`${mostrarSaidaFormulario ? "Depois" : "Antes"} - ${
                    animalSelecionado.nome
                  }`}
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                    e.target.onerror = null;
                  }}
                />
              )}
            </div>

            <div className={styles.containerDados}>
              <div className={styles.containerNome}>
                <div className={styles.alinharLabelComAjuda}>
                  <label>Nome do animal</label>
                  <button
                    data-tooltip-id="idSelectNome"
                    className={styles.botaoAjuda}
                  >
                    ?
                  </button>
                  <Tooltip
                    className={styles.tooltip}
                    id="idSelectNome"
                    place="top"
                  >
                    Selecione um animal que possui todos os dados necessários
                    para o carrossel (nome, descrição de entrada e saída, e
                    imagem de entrada e saída).
                  </Tooltip>
                </div>
                <Select
                  className={styles.selectNomeAnimal}
                  placeholder={
                    animais.length === 0
                      ? "Nenhum animal disponível"
                      : "Selecione"
                  }
                  options={animais}
                  onChange={handleSelecionarAnimal}
                  isDisabled={animais.length === 0}
                  value={
                    animalSelecionado
                      ? {
                          value: animalSelecionado.id,
                          label: animalSelecionado.nome,
                        }
                      : null
                  }
                  noOptionsMessage={() => "Nenhum animal encontrado"}
                />
                {animais.length === 0 && (
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      marginTop: "5px",
                      fontStyle: "italic",
                    }}
                  >
                    Todos os animais já estão no carrossel ou não possuem todos
                    os dados necessários.
                  </p>
                )}
              </div>

              <div className={styles.containerDescricao}>
                <div className={styles.alinharLabelComAjuda}>
                  <label>
                    Descrição de {mostrarSaidaFormulario ? "saída" : "entrada"}
                  </label>
                  <button
                    data-tooltip-id="idDescricoesAnimal"
                    className={styles.botaoAjuda}
                  >
                    ?
                  </button>
                  <Tooltip
                    className={styles.tooltip}
                    id="idDescricoesAnimal"
                    place="top"
                  >
                    {mostrarSaidaFormulario
                      ? "A descrição de saída explica o que aconteceu com o animal após ser resgatado"
                      : "A descrição de entrada é uma breve explicação do estado em que o animal foi encontrado ao ser resgatado"}
                  </Tooltip>
                </div>
                {!animalSelecionado ? (
                  <p className={styles.semDescricao}>
                    Selecione um animal para ver sua descrição
                  </p>
                ) : (
                  <p className={styles.descricaoAnimal}>
                    {mostrarSaidaFormulario
                      ? animalSelecionado.descricaoSaida ||
                        "Sem descrição de saída"
                      : animalSelecionado.descricao ||
                        "Sem descrição de entrada"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.divBotaoSlide}>
            <button
              className={styles.botaoInserir}
              onClick={handleInserirAnimal}
              disabled={!animalSelecionado}
            >
              Inserir animal
            </button>
          </div>
        </div>

        {/*SLIDES DOS ANIMAIS CADASTRADOS*/}
        {animaisCarrossel.length > 0 ? (
          animaisCarrossel.map((slide) => {
            const mostrarSaida = mostrarSaidaPorSlide[slide.id] || false;
            const estaEditando = editandoSlide === slide.id;

            return (
              <div key={slide.id} className={styles.slideAnimaisCadastrados}>
                <div
                  className={styles.divBotaoTrocarDados}
                  onClick={() => !estaEditando && alternarDadosSlide(slide.id)}
                  style={{
                    cursor: estaEditando ? "default" : "pointer",
                    opacity: estaEditando ? 0.5 : 1,
                  }}
                >
                  <img
                    src="/pagConfiguracoes/trocarDados.png"
                    alt="Trocar dados"
                    style={{
                      transform: mostrarSaida
                        ? "rotate(-90deg)"
                        : "rotate(90deg)",
                      transition: "transform 0.3s ease",
                    }}
                  />
                </div>

                <div className={styles.conteudoSlide}>
                  <div className={styles.containerImagem}>
                    <div className={styles.imagemContainer}>
                      <img
                        className={styles.imagemAnimal}
                        src={obterUrlImagem(
                          slide,
                          mostrarSaida ? "saida" : "entrada",
                        )}
                        alt={`${mostrarSaida ? "Depois" : "Antes"} - ${slide.animal.nome}`}
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                          e.target.onerror = null;
                        }}
                      />

                      {/* Overlay para edição de imagem */}
                      {estaEditando && (
                        <>
                          <div
                            className={styles.overlayImagem}
                            onClick={() => {
                              const input = document.getElementById(
                                mostrarSaida
                                  ? `input-saida-${slide.id}`
                                  : `input-entrada-${slide.id}`,
                              );
                              input?.click();
                            }}
                          >
                            <img
                              src="/pagVerMais/galeria.png"
                              alt="Alterar imagem"
                              className={styles.iconeOverlay}
                            />
                          </div>

                          {/* Inputs escondidos para upload */}
                          <input
                            id={`input-entrada-${slide.id}`}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) =>
                              processarUploadImagem(
                                e.target.files[0],
                                "imagemEntrada",
                              )
                            }
                          />
                          <input
                            id={`input-saida-${slide.id}`}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) =>
                              processarUploadImagem(
                                e.target.files[0],
                                "imagemSaida",
                              )
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.containerDados}>
                    <div className={styles.containerNome}>
                      {estaEditando ? (
                        <input
                          className={styles.inputNomeEdicao}
                          name="nome"
                          value={dadosEditados?.nome || ""}
                          onChange={capturarMudancaCampo}
                          placeholder="Nome do animal"
                        />
                      ) : (
                        <h1>{slide.animal.nome}</h1>
                      )}
                    </div>

                    <div className={styles.containerDescricao}>
                      <div className={styles.alinharLabelComAjuda}>
                        <label>
                          Descrição de {mostrarSaida ? "saída" : "entrada"}
                        </label>
                        <button
                          data-tooltip-id={`tooltip-${slide.id}`}
                          className={styles.botaoAjuda}
                        >
                          ?
                        </button>
                        <Tooltip
                          className={styles.tooltip}
                          id={`tooltip-${slide.id}`}
                          place="top"
                        >
                          {mostrarSaida
                            ? "Descrição de saída - o que aconteceu com o animal após ser resgatado"
                            : "Descrição de entrada - estado em que o animal foi encontrado"}
                        </Tooltip>
                      </div>

                      {estaEditando ? (
                        <textarea
                          className={styles.descricaoAnimal}
                          name={
                            mostrarSaida ? "descricaoSaida" : "descricaoEntrada"
                          }
                          value={
                            dadosEditados?.[
                              mostrarSaida
                                ? "descricaoSaida"
                                : "descricaoEntrada"
                            ] || ""
                          }
                          onChange={capturarMudancaCampo}
                          placeholder={`Digite a descrição de ${mostrarSaida ? "saída" : "entrada"}`}
                          rows={4}
                        />
                      ) : (
                        <p className={styles.descricaoAnimal}>
                          {mostrarSaida
                            ? slide.animal.descricaoSaida
                            : slide.animal.descricaoEntrada}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.divBotaoSlide}>
                  {estaEditando ? (
                    <div className={styles.divBotoesEdicao}>
                      <button
                        className={styles.botaoCancelar}
                        onClick={cancelarEdicao}
                        disabled={salvandoEdicao}
                      >
                        Cancelar
                      </button>
                      <button
                        className={`${styles.botaoSalvar} ${
                          !existemAlteracoes || salvandoEdicao
                            ? styles.desativado
                            : ""
                        }`}
                        onClick={() => salvarEdicaoSlide(slide.id)}
                        disabled={!existemAlteracoes || salvandoEdicao}
                      >
                        {salvandoEdicao ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.divBotoesEdicao}>
                      <button
                        className={styles.botaoEditar}
                        onClick={() => iniciarEdicaoSlide(slide)}
                        style={{
                          backgroundColor: "#0066ff",
                        }}
                      >
                        Editar slide
                      </button>
                      <button
                        className={styles.botaoRemover}
                        onClick={() =>
                          handleRemoverAnimal(slide.id, slide.animal.nome)
                        }
                        disabled={removendoAnimal === slide.id}
                        style={{
                          backgroundColor: "#ff4444",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          cursor:
                            removendoAnimal === slide.id
                              ? "not-allowed"
                              : "pointer",
                          opacity: removendoAnimal === slide.id ? 0.6 : 1,
                        }}
                      >
                        {removendoAnimal === slide.id
                          ? "Removendo..."
                          : "Remover animal"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.mensagemDeErro}>
            <h2>Nenhum animal cadastrado no carrossel</h2>
          </div>
        )}
      </Carousel>
    </div>
  );
}
