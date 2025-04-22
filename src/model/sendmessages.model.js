import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Sendmessage =  dbPost.define('sendmessages', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            receiver: {
                type: Sequelize.BIGINT
            },
            messageinit: {
                type: Sequelize.STRING
            },
            text: {
                type: Sequelize.STRING(800)
            },
            title: {
                type: Sequelize.STRING
            },
            url: {
                type: Sequelize.STRING
            },
            description:{
                type: Sequelize.STRING
            },
            jpegThumbnail:{
                type: Sequelize.STRING
            },
            endpointmsg:{
                type: Sequelize.STRING
            },
            dataimport: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            datasend: {
                type: Sequelize.DATE
            },
            statussend: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            session: {
                type: Sequelize.STRING
            },
            textbutton:{
                type: Sequelize.STRING
            },
            footerbutton:{
                type: Sequelize.STRING
            },
            urlButton_displayText: {
                type: Sequelize.STRING
            },
            urlButton_url: {
                type: Sequelize.STRING
            },
            callButton_displayText: {
                type: Sequelize.STRING
            },
            callButton_phoneNumber: {
                type: Sequelize.STRING
            },
            quickReplyButton_displayText: {
                type: Sequelize.STRING
            },
            quickReplyButton_id: {
                type: Sequelize.STRING
            },
            messageid:{
                type: Sequelize.STRING
            },
            type: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            id_campaing:{
               type: Sequelize.INTEGER
            },
            company_id:{
                type: Sequelize.INTEGER
            },
            checked:{
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            code:{
                type: Sequelize.INTEGER,
                defaultValue: 0
            }
    },  
        { timestamps: false },
        { createdAt: false },
        { updatedAt: false },
        {
            freezeTableName: true,
            tableName: "sendmessages"
        }
)
 
export default Sendmessage