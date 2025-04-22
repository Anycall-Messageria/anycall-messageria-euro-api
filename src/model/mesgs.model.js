const myBrazilianDate = new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Messagesends =  dbPost.define('messagesends', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        receiver: {
            type: Sequelize.STRING
        },
        messages: {
            type: Sequelize.STRING(800)
        },
        statusSend: {
            type: Sequelize.BOOLEAN
        },
        stateMsg: {
            type: Sequelize.STRING
        },
        created: {
            type: Sequelize.DATE,
            defaultValue: Date.now() - 6*60*60*1000
        },
        credor: {
            type: Sequelize.INTEGER
        },
        session: {
            type: Sequelize.STRING(15)
        },
        queues_id: {
            type: Sequelize.INTEGER
        },
        id_campaing:  {
            type: Sequelize.INTEGER
        },
        company_id:{
            type: Sequelize.INTEGER
        },
        bot:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
    },

    
        { timestamps: false },
        { createdAt: false },
        { updatedAt: false },
        {
            freezeTableName: true
            //tableName: "messages"
        }
)

export default Messagesends