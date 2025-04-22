import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'


const Settings =  dbPost.define('settings', {
         id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            data_restart: {
                type: Sequelize.BIGINT
            },
            type:{
                type: Sequelize.INTEGER,
                defaultValue: 0
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


export default Settings