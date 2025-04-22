import { BOOLEAN, Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Companies =  dbPost.define('companies', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            company: {
                type: Sequelize.STRING(80),
                allowNull: false
            },
            company_responsible: {
                type: Sequelize.STRING(80),
                allowNull: false
            },
            company_cpf: {
                type: Sequelize.STRING(14),
                allowNull: false
            },
            company_email: {
                type: Sequelize.STRING(150),
                allowNull: false
            },
            company_password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            company_phone: {
                type: Sequelize.STRING(16),
                allowNull: false
            },
            company_api_key: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            data: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            is_active_company:{
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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

export default Companies