const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer')
const { montarDominios } = require('./montarDominios');
const { iniciarBanco } = require('./iniciarBanco');

const LIBERTADORES_TAG = "Copa Libertadores winner";
const CAMPEAO_BRASILEIRO_TAG = "Brazilian champion";
const COPA_DO_BRASIL_TAG = "Brazilian cup winner";
const SUPERCOPA_TAG = "Winner Supercopa do Brasil";
const ARTILHEIRO_TAG = 'TOP GOAL SCORER';
const ARTILHEIRO_CHILD_TAG = 'Campeonato Brasileiro Série A';
const CHAMPIONS_TAG = "Champions League winner";
const COPA_DO_MUNDO_TAG = "World Cup winner";
const COPA_AMERICA_TAG = "Copa América winner";

const getPlayerInfo = (obj) => {
    return new Promise(async (resolve, reject) => {
        const jogadores = await obj.jogadores.findAll();
        const browser = await puppeteer.launch({
            headless: false
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1024 });

        // let naoPreenchidos = jogadores
        //     .filter(e => {
        //         return e.isCampeaoBrasileiro == null;
        //     })
        //     .map(e => {
        //         return {
        //             guid: e.guid,
        //             nome: e.nome
        //         }
        //     });

        

        let naoPreenchidos = jogadores.filter(e => {
            return e.isCampeaoChampions || e.isCampeaoCopaMundo || e.isArtilheiro
        })

        naoPreenchidos = [...new Map(naoPreenchidos.map(item =>
            [item.guid, item])).values()]

        for (let jogador of naoPreenchidos) {
            try {
                const url = `https://www.transfermarkt.com/${jogador.idNome}/erfolge/spieler/${jogador.guid}`;
                await page.goto(url);

                const dataNascimento = await page.evaluate(() => {
                    return document.querySelector('[itemprop=birthDate]').innerText
                })

                let nacionalidade = await page.evaluate(() => {
                    return document.querySelector('[itemprop=nationality]').innerText
                });

                /** Ajustando nome do país */
                nacionalidade = nacionalidade.substring(1);

                const titulos = await page.$$eval('.erfolg_bild_box', (evt) => {
                    return evt.map(e => {
                        return e.children[0].attributes.alt.nodeValue
                    })
                })

                const artilheiros = await page.$$eval('.large-8 .row .large-6', (evt) => {
                    return evt.map(e => {
                        const tituloAba = e.children[0].children[0].innerText
                        const tabela = Array.from(e.children[0].children[1].children[1].children[0].children[0].children).map(f => {
                            return f.children[2].children[1] && f.children[2].children[1].innerText
                        })
                        return { tituloAba, tabela }
                    })
                })

                const isCampeaoLibertadores = titulos.includes(LIBERTADORES_TAG);
                const isCampeaoBrasileiro = titulos.includes(CAMPEAO_BRASILEIRO_TAG);
                const isCampeaoCopaDoBrasil = titulos.includes(COPA_DO_BRASIL_TAG);
                const isCampeaoSupercopa = titulos.includes(SUPERCOPA_TAG);
                const isArtilheiro = artilheiros.some(e => {
                    return e.tituloAba.includes(ARTILHEIRO_TAG)
                            && e.tabela.includes(ARTILHEIRO_CHILD_TAG)
                })
                const isCampeaoChampions = titulos.includes(CHAMPIONS_TAG);
                const isCampeaoCopaMundo = titulos.includes(COPA_DO_MUNDO_TAG);
                const isCampeaoCopaAmerica = titulos.includes(COPA_AMERICA_TAG);

                const jogadoresMesmoNome = await obj.jogadores.findAll({
                    where: {
                        guid: jogador.guid
                    }
                })

                for (let jogadorMesmoNome of jogadoresMesmoNome) {
                    Object.assign(jogadorMesmoNome, {
                        dataNascimento,
                        nacionalidade,
                        isCampeaoLibertadores,
                        isCampeaoBrasileiro,
                        isCampeaoCopaDoBrasil,
                        isCampeaoSupercopa,
                        isArtilheiro,
                        isCampeaoChampions,
                        isCampeaoCopaMundo,
                        isCampeaoCopaAmerica
                    })
                    await jogadorMesmoNome.save();
                }

                console.log('Atualizou o jogador ' + jogador.nome);
            } catch (ex) {
                console.log(ex);
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