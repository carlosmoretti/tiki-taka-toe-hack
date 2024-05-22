const { Sequelize, DataTypes } = require('sequelize');

const montarDominios = (sequelize) => {
    return new Promise((resolve, reject) => {
        jogadores = sequelize.define('jogador', {
            guid: DataTypes.NUMBER,
            idNome: DataTypes.STRING,
            nome: DataTypes.STRING,
            time: DataTypes.STRING,
            idTime: DataTypes.STRING,
            urlJogador: DataTypes.STRING,
            isCampeaoBrasileiro: DataTypes.BOOLEAN,
            isCampeaoLibertadores: DataTypes.BOOLEAN,
            isCampeaoCopaDoBrasil: DataTypes.BOOLEAN,
            isCampeaoSupercopa: DataTypes.BOOLEAN,
            isArtilheiro: DataTypes.BOOLEAN,
            dataNascimento: DataTypes.STRING,
            nacionalidade: DataTypes.STRING
        });

        // jogadores.sync({ force: true });
        resolve({ sequelize, jogadores });
    })
}

module.exports = { montarDominios }