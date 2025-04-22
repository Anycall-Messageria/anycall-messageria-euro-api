import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Maturation =  dbPost.define('maturations', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            nomecampanha: {
                type: Sequelize.STRING(100)
            },
            identificador: {
                type: Sequelize.STRING(100)
            },
            sessionid: {
                type: Sequelize.STRING(100)
            },
            datainicio: {
                type: Sequelize.DATE
            },
            datafim: {
                type: Sequelize.DATE
            },
            observacoes:{
                type: Sequelize.STRING(2000)
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 5 //1-start 2-pause 4-stop 5-wait
            },
            data: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            company_id:{
                type: Sequelize.INTEGER
            },
            schedule: {
                type: Sequelize.INTEGER,
                defaultValue: 5 //1-start 2-pause 4-stop 5-wait
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
 
export default Maturation