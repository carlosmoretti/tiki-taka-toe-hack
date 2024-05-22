const { Sequelize, DataTypes } = require('sequelize');

const iniciarBanco = (pathBanco) => {
    return new Promise((resolve, reject) => {
        const sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: './database_jogadores.sqlite'
        });
    
        try {
            sequelize.authenticate();
            console.log('Connection has been established successfully.');
            resolve(sequelize)
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    })
}

module.exports = { iniciarBanco }