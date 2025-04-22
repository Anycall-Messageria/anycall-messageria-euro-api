import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Log =  dbPost.define('logs', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            log: {
                type: Sequelize.STRING(2000)
            },
            sessionid: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING(2000)
            },
            data: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            company_id:{
                type: Sequelize.INTEGER
            }
    },  
        { timestamps: false },
        { createdAt:  false },
        { updatedAt:  false },
        {
            freezeTableName: true
            //tableName: "sessions"
        }
)
 
export default Log