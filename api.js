const express = require('express');
const { Sequelize, QueryTypes } = require('sequelize');
const { montarDominios } = require('./montarDominios');
const { iniciarBanco } = require('./iniciarBanco');

const app = express();
const cors = require('cors') 

app.use(cors());
app.use(express.json());

const shuffleAndSlice = (itens, qtd) => {
    itens = itens.sort( () => Math.random() - 0.5).slice(0, qtd);

    return itens.map(e => {
        return `${e.nome} - ${e.dataNascimento}`
    }).join(', ')
}

const mapTimeTaca = [
    { nomeTaca: 'Brazilian League Top Scorer', prop: 'isArtilheiro' },
    { nomeTaca: 'Brazilian Top Division', prop: 'isCampeaoBrasileiro' },
    { nomeTaca: 'Copa América', prop: 'isCampeaoCopaAmerica' },
    { nomeTaca: 'World Cup', prop: 'isCampeaoCopaMundo'},
    { nomeTaca: 'Champions League', prop: 'isCampeaoChampions' },
    { nomeTaca: 'Copa do Brasil', prop: 'isCampeaoCopaDoBrasil'}
]

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
                
                if (timeX.isTime && timeY.isTime) {
                    const res = await consultarTimes(sequelize, timeX.nomeTime, timeY.nomeTime)
                    prompt = shuffleAndSlice(res, 3);
                }

                if((timeX.isNacao && timeY.isTime) || (timeY.isNacao && timeX.isTime)) {
                    const time = [timeX, timeY].find(e => e.isTime);
                    const nacionalidade = [timeX, timeY].find(e => e.isNacao);
                    const res = await consultarTimeNacao(sequelize, time.nomeTime, nacionalidade.nomeTime)
                    prompt = shuffleAndSlice(res, 3);
                }

                if((timeX.isTaca && timeY.isTime) || (timeY.isTaca && timeX.isTime)) {
                    const time = [timeX, timeY].find(e => e.isTime);
                    const taca = [timeX, timeY].find(e => e.isTaca);
                    const prop = mapTimeTaca.find(e => e.nomeTaca == taca.nomeTime).prop;
                    const res = await consultarTimeTaca(sequelize, time.nomeTime, prop)
                    prompt = shuffleAndSlice(res, 3);
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

const consultarTimeTaca = async (sequelize, time, prop) => {
    const query = `select c.* from (
        select b.guid, b.nome, b.dataNascimento, count(*) as total, group_concat(time) from (
            select distinct guid, nome, time, dataNascimento, nacionalidade, ${prop} from jogadors
        ) b where b.time = '${time}' and b.${prop} = 1
        group by b.nome
    ) c`;

    return await sequelize.query(query, { 
        type: QueryTypes.SELECT
    })
}

const consultarTimes = async (sequelize, time1, time2) => {
    const query = `select c.* from (
            select b.guid, b.nome, b.dataNascimento, count(*) as total, group_concat(time) from (
                select distinct guid, nome, time, dataNascimento from jogadors
            ) b where b.time in ('${time1}', '${time2}')
            group by b.nome
        ) c
        where c.total > 1`;

    return await sequelize.query(query, { 
        type: QueryTypes.SELECT
    })
}

const consultarTimeNacao = async (sequelize, time, nacao) => {
    const query = `select c.* from (
        select b.guid, b.nome, b.dataNascimento, count(*) as total, group_concat(time) from (
            select distinct guid, nome, time, dataNascimento, nacionalidade from jogadors
        ) b where b.time = '${time}' and b.nacionalidade = '${nacao}'
        group by b.nome
    ) c`;

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
            response.send(e);
        })
});