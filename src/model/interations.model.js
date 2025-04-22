  
import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'
//jid, firstconversation, fromme

const Interation =  dbPost.define('interations', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            jid: {
                type: Sequelize.STRING
            },
            firstconversation: {
                type: Sequelize.INTEGER
            },
            lastconversation: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            users: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            finalization: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            fromme: {
                type: Sequelize.INTEGER
            },
            session: {
                type: Sequelize.STRING
            },
            urlProfile: {
                type: Sequelize.STRING
            },
            session_id: {
                type: Sequelize.INTEGER
            },
            company_id:{
                type: Sequelize.INTEGER
            },
            tag_id:{
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            id_campaing:{
                type: Sequelize.INTEGER
            },
            first_answer:{
                type: Sequelize.INTEGER                
            },
        },  
        { timestamps: false },
        { createdAt: false },
        { updatedAt: false },
        {
            freezeTableName: true
            //tableName: "chats"
        }
)


export default Interation

  
