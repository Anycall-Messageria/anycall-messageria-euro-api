
import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'


const Greetingmessage = dbPost.define('greetingmessages', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            salutation: {
                type: Sequelize.STRING
            },
            type: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            daterecord: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            company_id:{
                type: Sequelize.INTEGER
            }
    },  
        { timestamps: false },
        { createdAt: false },
        { updatedAt: false },
        {
            freezeTableName: true,
            //tableName: "users"
        }
)

export default Greetingmessage
 





