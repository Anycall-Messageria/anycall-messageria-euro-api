import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

 const OcorrencesStatus =  dbPost.define('status_ocorrences', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            status_ocor_desc: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            status:{
                type: Sequelize.BOOLEAN,
                defaultValue: true
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


export default OcorrencesStatus