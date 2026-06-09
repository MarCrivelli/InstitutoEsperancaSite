"use client";
import BotaoPagInicial from "../BotaoPagInicial/app";
import styles from "./verMais.module.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderAdms from "../HeaderAdms/app";

export default function VerMais() {
  const { id } = useParams(); // Pegando o ID da URL
  const [animal, setAnimal] = useState({});

  useEffect(() => {
    const buscarAnimal = async () => {
      try {
        const resposta = await fetch(
          `http://localhost:3003/listar/animal/${id}`
        );
        const dados = await resposta.json();
        setAnimal(dados);
      } catch {
        alert("Ocorreu um erro no app!");
      }
    };
    buscarAnimal();
  }, [id]); // Coloque o ID na dependência para evitar erros

  return (
    <div>
      <HeaderAdms />
      <BotaoPagInicial />
      <div className={styles.alinharPainel}>
        <div className={styles.fundoPainel}>
          <div className={styles.painel}>
            <div className={styles.dadosIdentificacao}>
              <div className={styles.imagemIdentificacao}>
                <h1 className={styles.tituloImagem}>Antes</h1>
                <img className={styles.imagemVerMais} src="/pagFichasDAnimais/imagemTeste.jpg"></img>
              </div>
              <div className={styles.imagemIdentificacao}>
                <h1 className={styles.tituloImagem}>Depois</h1>
                <img className={styles.imagemVerMais} src="/pagFichasDAnimais/imagemTeste.jpg"></img>
              </div>
              <h1 className={styles.nomeAnimal}>{animal.nome}</h1>
            </div>
            {/* 
            <p>Idade: {animal.idade}</p>
            <p>Sexo: {animal.sexo}</p>
            <p>Status de Castração: {animal.statusCastracao}</p>
            <p>Status de Adoção: {animal.statusAdocao}</p> */}
          </div>
        </div>
      </div>
    </div>
  );
}
