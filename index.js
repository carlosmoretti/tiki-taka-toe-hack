const { Sequelize } = require('sequelize')
const puppeteer = require('puppeteer');

const { iniciarBanco } = require('./iniciarBanco')
const { montarDominios } = require('./montarDominios')

const split = (urlTime, indice) => {
    return urlTime.split('/')[indice];
}


const buscarTimes = (config) => {
    return new Promise(async (resolve, reject) => {
        const url = 'https://www.transfermarkt.com.br/campeonato-brasileiro-serie-a/startseite/wettbewerb/BRA1';

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1024 });
        await page.goto(url);

        const times = await page.$$eval('.large-8 #yw1.grid-view tbody tr', (evt) => {
            return evt.map(e => {
                const nomeTime = e.cells[1].innerText;
                const urlTime = e.cells[1].children[0].href
                return { nomeTime, urlTime, e }
            })
        })

        for(let time of times) {
            const guidTime = split(time.urlTime, 6);
            const idTime = split(time.urlTime, 3);
            const urlTransferencia = `https://www.transfermarkt.com.br/${idTime}/alletransfers/verein/${guidTime}`

            console.log('Salvando ' + idTime);
            await page.goto(urlTransferencia)

            const jogadores = await page.$$eval('tbody tr', (evt) => {
                return evt.map(e => {
                    const jogador = e.cells[0].children[0].innerText
                    const urlJogador = e.cells[0].children[0].href
                    const time = e.cells[2].children[0] && e.cells[2].children[0].innerText

                    return { jogador, urlJogador, time, e }
                })
            })

            for(let jogador of jogadores) {
                const guidJogador = split(jogador.urlJogador, 6)
                const idJogador = split(jogador.urlJogador, 3)

                const bean = {
                    guid: guidJogador,
                    idNome: idJogador,
                    nome: jogador.jogador,
                    time: jogador.time,
                    urlJogador: jogador.urlJogador
                }

                await config.jogadores.create(bean)
            }
        }

        resolve(times);
    });
}

iniciarBanco('./database_jogadores.sqlite')
    .then(sequelize => montarDominios(sequelize))
    .then(config => buscarTimes(config))