import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'
import { NumbersOperators } from "./newMobiles.model.js"

const Session =  dbPost.define('sessions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING
            },
            number: {
                type: Sequelize.BIGINT
            },
            status: {
                type: Sequelize.STRING
            },
            data: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            lastdate: {
                type: Sequelize.DATE
            },
            lastcount: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            laststates:{
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            urlprofile:{
                type: Sequelize.STRING
            },
            numbermessagessent:{
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            sleepingsession:{
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            namesession:{
                type: Sequelize.STRING
            },
            clientsessionid: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            randomize: {
                type: Sequelize.INTEGER
            },
            countdisconnected: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            maturation: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            start:{
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            profile_name:{
                type: Sequelize.STRING(60)
            },
            profile_status:{
                type: Sequelize.STRING(60)
            },
            profile_image:{
                type: Sequelize.STRING(255)
            },
            company_id:{
                type: Sequelize.INTEGER
            },
            numberId: {
                type: Sequelize.INTEGER
            },
    },  
        { timestamps: false },
        { createdAt:  false },
        { updatedAt:  false },
        {
            freezeTableName: true
            //tableName: "sessions"
        }
)
 

export default Session