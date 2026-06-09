import 'bootstrap/dist/css/bootstrap.css';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import styles from "./mainAdm.module.css";
import HeaderAdms from "../HeaderAdms/app";
import BotaoPagInicial from "../BotaoPagInicial/app";


export default function HomeAdms() {

    var erro = false;

    if (erro) {
        return (
            <h1>Erro</h1>
        );
    }

    return (
        <div>
            <HeaderAdms />
            {/* Importações que não alteram outras coisas na página */}
            <BotaoPagInicial/>

            <div className={styles.painel}>
                <div className={`${styles.card} ${styles.card1}`}>
                        <img className={styles.iconeCopiar} src="/homeAdms/iconeCopiar.png"></img>
                    <div className={styles.conteudoPrincipalAvisos}>
                        <h1>Quadro de Avisos</h1>
                        <div className={styles.containerLembretes}></div>
                        <div className={styles.alinharBotoesAviso}>
                            <button className={styles.botaoCard1}>Adicionar Aviso</button>
                            <button className={styles.botaoCard1}>Remover Aviso</button>
                        </div>
                    </div>
                </div>
                <div className={`${styles.card} ${styles.card2}`}>
                    <div className={styles.divLembrete}>
                        <h1>Lembrete de vacinação</h1>
                        <p>Há <span className={styles.sublinhadoVacinacao}>999</span> animais a serem vacinados</p>
                    </div>
                </div>
                <div className={`${styles.card} ${styles.card3}`}>
                    
                </div>
                <div className={`${styles.card} ${styles.card4}`}>
                    <img
                      src="/usuario.png"
                      alt="Botão que leva à página de autenticação"
                      className={styles.iconeAvatar}
                    />
                    <h1 className={styles.nomeUsuario}>Nome Qualquer de Usuário</h1>
                    <div className={styles.infoUsuario}>
                        <p><strong>Última alteração:</strong> há 999 dias</p>
                        <p><strong>Nível de acesso:</strong> administrador</p>
                    </div>
                    <div className={styles.alinharBotoesCard4}>
                        <button className={`${styles.padraoBotao} ${styles.botaoEscuro}`}>Funções de administrador</button>
                        <button className={`${styles.padraoBotao} ${styles.botaoClaro}`}>Configurar Perfil</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
