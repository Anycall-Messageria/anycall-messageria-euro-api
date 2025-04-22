import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'


const Servicequeue =  dbPost.define('servicequeues', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            queue: {
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            tenantId: {
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
        }
)

export default Servicequeue