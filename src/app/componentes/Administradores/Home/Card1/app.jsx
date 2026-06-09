import styles from "./card1.module.css";

const Lembrete = ({ data, descricao, corData, onRemover, isNovo = false }) => {
  return (
    <div className={`${styles.lembreteItem} ${isNovo ? styles.lembreteNovoAdicionado : styles.lembreteCarregado}`}>
      <span className={styles.lembreteData} style={{ color: corData }}>
        {data + ": "}
        <span className={styles.lembreteDescricao}>{descricao}</span>
      </span>
      <button className={styles.lembreteLixeira} onClick={onRemover}>
        🗑️
      </button>
    </div>
  );
};

export default function Card1({
  lembretes,
  abrirFormulario,
  containerRef,
  mostrarFormulario,
  novoLembrete,
  handleChange,
  adicionarLembrete,
  fecharFormulario,
  removerLembrete,
  ultimoLembreteId,
}) {
  return (
    <>
      <div className={styles.containerWrapper}>

        <div className={styles.containerLembretes} ref={containerRef}>
          {lembretes.map((lembrete) => (
            <Lembrete
              key={lembrete.id}
              data={lembrete.data}
              descricao={lembrete.descricao}
              corData={lembrete.corData}
              onRemover={() => removerLembrete(lembrete.id)}
              isNovo={lembrete.id === ultimoLembreteId}
            />
          ))}
        </div>

        <button className={styles.botaoAdicionar} onClick={abrirFormulario}>
          
        </button>
        
      </div>

      {mostrarFormulario && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h1>Novo Lembrete</h1>

            <div className={styles.alinharLadoALado}>
              <input
                type="checkbox"
                name="ehPeriodo"
                checked={novoLembrete.ehPeriodo}
                onChange={handleChange}
                className={styles.inputPeriodo}
              />
              <label className={styles.labelNaFrente}>Período (em vez de data única)</label>
            </div>

            <div className={styles.alinharAcima}>
              <label className={styles.labelInserirAviso}>
                Data {novoLembrete.ehPeriodo ? "Inicial" : ""}
              </label>
              <input
                type="date"
                name="dataInicio"
                value={novoLembrete.dataInicio}
                onChange={handleChange}
                required
                className={styles.inputInserirAviso}
              />
            </div>

            {novoLembrete.ehPeriodo && (
              <div className={styles.alinharAcima}>
                <label className={styles.labelInserirAviso}>Data Final</label>
                <input
                  type="date"
                  name="dataFim"
                  value={novoLembrete.dataFim}
                  onChange={handleChange}
                  required
                  className={styles.inputInserirAviso}
                />
              </div>
            )}

            <div className={styles.alinharAcima}>
              <label className={styles.labelInserirAviso}>Descrição</label>
              <textarea
                name="descricao"
                value={novoLembrete.descricao}
                onChange={handleChange}
                required
                className={`${styles.inputInserirAviso} ${styles.textareaInserirAviso}`}
              />
            </div>

            <div className={styles.alinharLadoALado}>
              <input
                type="color"
                name="corData"
                value={novoLembrete.corData}
                onChange={handleChange}
                className={styles.inputDeCor}
              />
              <label className={styles.labelNaFrente}>Cor da Data</label>
            </div>

            <div className={styles.botoesForm}>
              <button onClick={fecharFormulario}>Cancelar</button>
              <button onClick={adicionarLembrete}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}