import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'


const RefreshToken =  dbPost.define('refresh_tokens', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            refresh_id:{
                type: Sequelize.STRING(100),
                allowNull: false
            },
            experes_in:{
                type: Sequelize.INTEGER,
                
            },
            userid: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
    },  
        { timestamps: false },
        { createdAt:  false },
        { updatedAt:  false },
        {
            freezeTableName: true
        }
)
 
export default RefreshToken