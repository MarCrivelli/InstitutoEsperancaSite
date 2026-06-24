import { useNavigate } from "react-router-dom";

export default function useNavegarComTransicao() {
  const navigate = useNavigate();

  const navegarComTransicao = (rota) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(rota);
      });
    } else {
      navigate(rota);
    }
  };

  return navegarComTransicao;
}