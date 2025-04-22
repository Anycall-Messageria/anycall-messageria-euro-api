import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'


const Tag =  dbPost.define('tags', {
         id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            tag: {
                type: Sequelize.STRING
            },
            color: {
                type: Sequelize.STRING
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            userId: {
                type: Sequelize.INTEGER
            },
            tenantId: {
                type: Sequelize.INTEGER
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


export default Tag