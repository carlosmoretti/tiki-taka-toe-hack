const express = require('express');
const { Sequelize, QueryTypes } = require('sequelize');
const { montarDominios } = require('../montarDominios');
const { iniciarBanco } = require('../iniciarBanco');

const app = express();
app.use(express.json());

const buscarJogadores = (sequelize, times) => {
    return new Promise(async (resolve, reject) => {

        const timesX = times.splice(0, 3);
        const timesY = times.splice(0, 3);

        const testes = [];
        for (let i = 0; i < timesX.length; i++) {
            for (let y = 0; y < timesY.length; y++) {
                const timeX = timesX[i];
                const timeY = timesY[y];

                let prompt = null;
                if (!timeX.isNacao && !timeY.isNacao) {
                    const res = await consultarTimes(sequelize, timeX.nomeTime, timeY.nomeTime)
                    prompt = 'Teste';
                } else {
                    const nacao = [timeX, timeY].find(e => e.isNacao);
                    const time = [timeX, timeY].find(e => !e.isNacao)
                    prompt = (`Cite o nome e data de nascimento de um jogador nascido em ${nacao.nomeTime} e joga ou já jogou clube Brasileiro ${time.nomeTime}.`)
                }

                testes.push({
                    prompt,
                    titulo: `${timeX.nomeTime} x ${timeY.nomeTime}`,
                })
            }
        }

        resolve(testes)
    })
}

const consultarTimes = async (sequelize, time1, time2) => {
    const query = `select c.* from (
            select b.nome, b.dataNascimento, count(*) as total, group_concat(time) from (
                select distinct nome, time, dataNascimento from jogadors
            ) b where b.time in ('${time1}', '${time2}')
            group by b.nome
        ) c
        where c.total > 1`;

    return await sequelize.query(query, { 
        type: QueryTypes.SELECT
    })
}

app.listen(3000, () => {
    console.log('API iniciada');
});

app.post("/", (request, response) => {
    console.log(request.body)

    iniciarBanco('../database_jogadores.sqlite')
        .then(sequelize => montarDominios(sequelize))
        .then(obj => buscarJogadores(obj.sequelize, request.body))
        .then(e => {
            response.send(200);
        })
});