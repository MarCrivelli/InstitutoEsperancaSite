//Importações para as rotas funcionarem
import { HashRouter, BrowserRouter, Route, Routes } from "react-router-dom";
//Importações para as páginas de visitantes
import HomeVisitantes from "../componentes/Visitantes/Home/PaginaPrincipal/app";
import GerenciarUsuario from "../componentes/PaginaDeUsuarios/PaginaPrincipal/app";
import QueroAdotar from "../componentes/Visitantes/PaginaDeAdocoes/app";
import ComoDoar from "../componentes/Visitantes/PaginaDeDoacoes/app";
import Denuncie from "../componentes/Visitantes/PaginaDeDenuncias/app";
import SaudeUnica from "../componentes/Visitantes/PaginaDeSaudeUnica/app";
//Importações para as páginas de administradores
import RotaProtegida from "./rotaProtegida";
import HomeAdms from "../componentes/Administradores/Home/PaginaPrincipal/app";
import FichasDeAnimais from "../componentes/Administradores/PaginaDeAnimais/PaginaPrincipal/app";
import Configuracoes from "../componentes/Administradores/PaginaDeConfiguracoes/PaginaPrincipal/app";
import ProgramarPostagem from "../componentes/Administradores/PaginaDePostagem/app";
import VerMais from "../componentes/Administradores/PaginaDeVerMais/app";

export default function Rotas() {
  return (
    <HashRouter basename="/">
      <Routes>
        {/*O "path" é uma indicação do que vai aparecer na URL do navegador*/}
        <Route path="/" element={<HomeVisitantes />} />
        <Route path="/autenticar" element={<GerenciarUsuario />} />
        <Route path="/quero_adotar" element={<QueroAdotar />} />
        <Route path="/como_doar" element={<ComoDoar />} />
        <Route path="/denuncie" element={<Denuncie />} />
        <Route path="/saude_unica" element={<SaudeUnica />} />

        <Route
          path="/administracao"
          element={
            <RotaProtegida
              niveisPermitidos={[
                "contribuinte",
                "subAdministrador",
                "administrador",
              ]}
            >
              <HomeAdms />
            </RotaProtegida>
          }
        />

        <Route
          path="/fichas_de_animais"
          element={
            <RotaProtegida
              niveisPermitidos={[
                "contribuinte",
                "subAdministrador",
                "administrador",
              ]}
            >
              <FichasDeAnimais />
            </RotaProtegida>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <RotaProtegida
              niveisPermitidos={[
                "contribuinte",
                "subAdministrador",
                "administrador",
              ]}
            >
              <Configuracoes />
            </RotaProtegida>
          }
        />

        <Route
          path="/programar_postagem"
          element={
            <RotaProtegida
              niveisPermitidos={[
                "contribuinte",
                "subAdministrador",
                "administrador",
              ]}
            >
              <ProgramarPostagem />
            </RotaProtegida>
          }
        />

        <Route
          path="/ver_mais/:id"
          element={
            <RotaProtegida
              niveisPermitidos={[
                "contribuinte",
                "subAdministrador",
                "administrador",
              ]}
            >
              <VerMais />
            </RotaProtegida>
          }
        />

        <Route
          path="*"
          element={
            <RotaProtegida
              niveisPermitidos={[
                "contribuinte",
                "subAdministrador",
                "administrador",
              ]}
            >
              <HomeVisitantes />
            </RotaProtegida>
          }
        />

      </Routes>
    </HashRouter>
  );
}
