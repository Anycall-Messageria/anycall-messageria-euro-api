import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'


const RecordMessages =  dbPost.define('recordmessages', {
         id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            tipo: {
                type: Sequelize.STRING
            },
            mensagem: {
                type: Sequelize.STRING(800)
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            datarecord: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            credorid: {
                type: Sequelize.INTEGER
            },
            credor: {
                type: Sequelize.STRING
            },
            company_id:{
                type: Sequelize.INTEGER
            }
    },  
        { timestamps: false },
        { createdAt:  false },
        { updatedAt:  false },
        {
            freezeTableName: true,
            //tableName: "tags"
        }
)


export default RecordMessages