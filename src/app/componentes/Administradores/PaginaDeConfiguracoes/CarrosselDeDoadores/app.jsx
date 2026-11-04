import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import api from "../../../../../../services/api";
import styles from "./carrossel.module.css";

export default function CarrosselDeDoadores({
  podeGerenciarCarrosseis,
}) {
  const [doadores, setDoadores] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);

  const [novoDoador, setNovoDoador] = useState({
    imagem: null,
    nome: "",
    descricao: "",
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const carregarDoadores = async () => {
      try {
        const response = await api.get("/doadores", {
          signal: controller.signal,
        });

        setDoadores(
          Array.isArray(response.data)
            ? response.data
            : [],
        );
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error(
            "Erro ao carregar doadores:",
            error,
          );
        }
      }
    };

    carregarDoadores();

    return () => {
      controller.abort();
    };
  }, []);

  /*
   * Garante que o índice nunca seja maior que a
   * quantidade atual de slides.
   */
  useEffect(() => {
    const totalSlides =
      doadores.length +
      (podeGerenciarCarrosseis ? 1 : 0);

    setIndiceAtual((indiceAnterior) => {
      if (totalSlides <= 0) {
        return 0;
      }

      return Math.min(
        indiceAnterior,
        totalSlides - 1,
      );
    });
  }, [
    doadores.length,
    podeGerenciarCarrosseis,
  ]);

  const handleImageChange = (event) => {
    const arquivo =
      event.target.files?.[0] || null;

    setNovoDoador((dadosAnteriores) => ({
      ...dadosAnteriores,
      imagem: arquivo,
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setNovoDoador((dadosAnteriores) => ({
      ...dadosAnteriores,
      [name]: value,
    }));
  };

  const adicionarDoador = async () => {
    if (
      !novoDoador.imagem ||
      !novoDoador.nome.trim() ||
      !novoDoador.descricao.trim()
    ) {
      return;
    }

    try {
      const formData = new FormData();

      formData.append(
        "imagem",
        novoDoador.imagem,
      );

      formData.append(
        "nome",
        novoDoador.nome.trim(),
      );

      formData.append(
        "descricao",
        novoDoador.descricao.trim(),
      );

      const response = await api.post(
        "/doadores",
        formData,
      );

      setDoadores((doadoresAnteriores) => [
        response.data,
        ...doadoresAnteriores,
      ]);

      setNovoDoador({
        imagem: null,
        nome: "",
        descricao: "",
      });

      setIndiceAtual(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(
        "Erro ao adicionar doador:",
        error.response?.data ||
          error.message,
      );
    }
  };

  const deletarDoador = async (id) => {
    try {
      await api.delete(`/doadores/${id}`);

      /*
       * Localiza a posição do slide excluído antes
       * de alterar a lista.
       */
      const indiceDoDoador =
        doadores.findIndex(
          (doador) => doador.id === id,
        );

      const novosDoadores =
        doadores.filter(
          (doador) => doador.id !== id,
        );

      /*
       * Quando o usuário pode gerenciar o
       * carrossel, o formulário ocupa o índice 0.
       */
      const deslocamentoFormulario =
        podeGerenciarCarrosseis ? 1 : 0;

      const totalDepoisDaExclusao =
        novosDoadores.length +
        deslocamentoFormulario;

      const novoIndice =
        totalDepoisDaExclusao > 0
          ? Math.min(
              indiceDoDoador +
                deslocamentoFormulario,
              totalDepoisDaExclusao - 1,
            )
          : 0;

      /*
       * Atualiza o índice antes de apresentar
       * novamente os slides.
       */
      setIndiceAtual(novoIndice);
      setDoadores(novosDoadores);
    } catch (error) {
      console.error(
        "Erro ao excluir doador:",
        error.response?.data ||
          error.message,
      );
    }
  };

  const totalSlides =
    doadores.length +
    (podeGerenciarCarrosseis ? 1 : 0);

  /*
   * Mesmo antes do useEffect executar, o Carousel
   * sempre recebe um índice válido.
   */
  const indiceSeguro =
    totalSlides > 0
      ? Math.max(
          0,
          Math.min(
            indiceAtual,
            totalSlides - 1,
          ),
        )
      : 0;

  /*
   * A identidade muda sempre que um doador é
   * adicionado ou excluído. Isso obriga a biblioteca
   * a descartar as cópias internas dos slides antigos.
   */
  const identidadeCarrossel =
    `doadores-${doadores
      .map((doador) => doador.id)
      .join("-")}`;

  return (
    <div
      className={
        styles.fundoCarrosselDoadores
      }
    >
      <div className={styles.painel}>
        <Carousel
          key={identidadeCarrossel}
          selectedItem={indiceSeguro}
          onChange={(novoIndice) =>
            setIndiceAtual(novoIndice)
          }
          showArrows
          showThumbs={false}
          showStatus={false}
          showIndicators={totalSlides > 1}
          infiniteLoop={false}
          preventMovementUntilSwipeScrollTolerance
          swipeScrollTolerance={40}
          className={styles.carrossel}
        >
          {podeGerenciarCarrosseis ? (
            <div
              key="formulario-doador"
              className={
                styles.slideFormulario
              }
            >
              <div
                className={
                  styles.containerPreImagem
                }
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  id="image-upload"
                />

                <label
                  htmlFor="image-upload"
                  className={
                    styles.botaoAddImagemDoador
                  }
                >
                  {novoDoador.imagem ? (
                    <img
                      src={URL.createObjectURL(
                        novoDoador.imagem,
                      )}
                      alt="Prévia da imagem"
                      className={
                        styles.fotoPreview
                      }
                    />
                  ) : (
                    <div
                      className={
                        styles.iconePadrao
                      }
                    >
                      <img
                        src={
                          `${
                            import.meta.env
                              .BASE_URL
                          }` +
                          "pagConfiguracoes/" +
                          "adicionarImagem.png"
                        }
                        alt="Adicionar imagem"
                      />
                    </div>
                  )}
                </label>
              </div>

              <input
                type="text"
                name="nome"
                value={novoDoador.nome}
                onChange={handleInputChange}
                placeholder="Nome do doador"
                className={styles.inputForm}
              />

              <textarea
                name="descricao"
                value={novoDoador.descricao}
                className={styles.textareaForm}
                onChange={(event) => {
                  if (
                    event.target.value.length <=
                    500
                  ) {
                    handleInputChange(event);
                  }
                }}
                placeholder={
                  "Descrição " +
                  "(máx. 500 caracteres)"
                }
              />

              <div
                className={styles.contador}
              >
                {novoDoador.descricao.length}
                /500 caracteres
              </div>

              <button
                type="button"
                onClick={adicionarDoador}
                disabled={
                  !novoDoador.imagem ||
                  !novoDoador.nome.trim() ||
                  !novoDoador.descricao.trim()
                }
                className={
                  styles.botaoAdicionar
                }
              >
                Adicionar doador
              </button>
            </div>
          ) : (
            []
          )}

          {doadores.map((doador) => (
            <div
              key={`doador-${doador.id}`}
              className={
                styles.itemCarrossel
              }
            >
              <div
                className={
                  styles.containerImagem
                }
              >
                <img
                  src={
                    `${
                      import.meta.env
                        .VITE_API_URL
                    }/uploads/${doador.imagem}`
                  }
                  alt={doador.nome}
                  className={
                    styles.fotoDoador
                  }
                  onError={(event) => {
                    event.currentTarget.onerror =
                      null;

                    event.currentTarget.src =
                      `${
                        import.meta.env.BASE_URL
                      }paraErros/user.png`;
                  }}
                />
              </div>

              <div
                className={
                  styles.infoDoador
                }
              >
                <h1>{doador.nome}</h1>
                <p>{doador.descricao}</p>
              </div>

              {podeGerenciarCarrosseis && (
                <button
                  type="button"
                  onClick={() => {
                    const confirmou =
                      window.confirm(
                        "Tem certeza que " +
                          "deseja remover " +
                          "este doador?",
                      );

                    if (confirmou) {
                      deletarDoador(
                        doador.id,
                      );
                    }
                  }}
                  className={
                    styles.botaoRemover
                  }
                >
                  Remover doador
                </button>
              )}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}