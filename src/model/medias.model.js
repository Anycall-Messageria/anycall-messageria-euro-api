import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

//CARTEIRA	SUPERVISAO	NIVEL

const Medias = dbPost.define('media', {
//export default dbPost.define('media', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            url: {
                type: Sequelize.STRING
            },
            name: {
                type: Sequelize.STRING
            },
            extension: {
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
            tableName: "medias"
        }
)
 
export default Medias