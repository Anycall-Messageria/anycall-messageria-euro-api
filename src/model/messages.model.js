import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'


const Message =  dbPost.define('messages', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            remotejid: {
                type: Sequelize.BIGINT
            },
            idmessage: {
                type: Sequelize.STRING
            },
            messagerecive: {
                type: Sequelize.STRING
            },
            messagetimestamp: {
                type: Sequelize.INTEGER
            },
            pushname:{
                type: Sequelize.STRING
            },
            datarecord: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            read: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            dateread: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            statusread: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            session: {
                type: Sequelize.STRING
            },
            fromme: {
                type: Sequelize.INTEGER
            },
            id_interation:{
                type: Sequelize.INTEGER
            },
            urlProfile:{
                type: Sequelize.STRING
            },
            company_id:{
                type: Sequelize.INTEGER
            },
            delivered: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            bot:{
                type: Sequelize.INTEGER,
                defaultValue: 0
            }

    },  
        { timestamps: false },
        { createdAt: false },
        { updatedAt: false },
        {
            freezeTableName: true
            //tableName: "messages"
        }
)
 
export default Message