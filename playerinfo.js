const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer')
const { montarDominios } = require('./montarDominios');
const { iniciarBanco } = require('./iniciarBanco');

const LIBERTADORES_TAG = 'CAMPEÃO DA COPA LIBERTADORES';
const CAMPEAO_BRASILEIRO_TAG = 'CAMPEÃO BRASILEIRO';
const COPA_DO_BRASIL_TAG = 'CAMPEÃO DA COPA DO BRASIL';
const SUPERCOPA_TAG = 'CAMPEÃO DA SUPERCOPA DO BRASIL';
const ARTILHEIRO_TAG = 'ARTILHEIRO';


const getPlayerInfo = (obj) => {
    return new Promise(async (resolve, reject) => {
        const jogadores = await obj.jogadores.findAll();
        const browser = await puppeteer.launch();

        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1024 });
        
        let naoPreenchidos = jogadores
            .filter(e => {
                return e.isCampeaoBrasileiro == null;
            })
            .map(e => {
                return { 
                    guid: e.guid,
                    nome: e.nome
                }
            });
        
        naoPreenchidos = [...new Map(naoPreenchidos.map(item =>
            [item.guid, item])).values()]

        for(let jogador of naoPreenchidos) {
            try {
                const url = `https://www.transfermarkt.com.br/${jogador.idNome}/erfolge/spieler/${jogador.guid}`;
                await page.goto(url);

                const dataNascimento = await page.evaluate(() => {
                    return document.querySelector('[itemprop=birthDate]').innerText
                })

                const nacionalidade = await page.evaluate(() => {
                    return document.querySelector('[itemprop=nationality]').innerText
                });

                /** Ajustando nome do país */
                nacionalidade = nacionalidade.substring(1);

                const titulos = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('.content-box-headline')).map(e => e.innerText)
                })

                const titulosJoined = titulos.join(',');
                const isCampeaoLibertadores = titulosJoined.includes(LIBERTADORES_TAG);
                const isCampeaoBrasileiro = titulosJoined.includes(CAMPEAO_BRASILEIRO_TAG);
                const isCampeaoCopaDoBrasil = titulosJoined.includes(COPA_DO_BRASIL_TAG);
                const isCampeaoSupercopa = titulosJoined.includes(SUPERCOPA_TAG);
                const isArtilheiro = titulosJoined.includes(ARTILHEIRO_TAG);

                const jogadoresMesmoNome = await obj.jogadores.findAll({
                    where: {
                        guid: jogador.guid
                    }
                })

                for(let jogadorMesmoNome of jogadoresMesmoNome) {
                    Object.assign(jogadorMesmoNome, { dataNascimento, nacionalidade, isCampeaoLibertadores, isCampeaoBrasileiro, isCampeaoCopaDoBrasil, isCampeaoSupercopa, isArtilheiro })
                    await jogadorMesmoNome.save();
                }

                console.log('Atualizou o jogador ' + jogador.nome);
            } catch(ex) {
                continue;
            }
        }
    })
}

return new Promise((resolve) => resolve(iniciarBanco('./database_jogadores.sqlite')))
    .then(sequelize => montarDominios(sequelize))
    .then(sequelize => getPlayerInfo(sequelize))
    .then(e => {
        console.log(e);
    });