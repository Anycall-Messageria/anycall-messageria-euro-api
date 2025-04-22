import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

 const Ocorrences =  dbPost.define('ocorrences', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            descricao: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            status_ocorrencia: {
                type: Sequelize.INTEGER
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


export default Ocorrences