import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Chats = dbPost.define('chats', {
//export default dbPost.define('chats', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            jid: {
                type: Sequelize.STRING
            },
            conversationtimestamp: {
                type: Sequelize.INTEGER
            },
            unreadCount: {
                type: Sequelize.INTEGER
            },
            company_id:{
                type: Sequelize.INTEGER
            }
    },  
        { timestamps: false },
        { createdAt: false },
        { updatedAt: false },
        {
            freezeTableName: true
            //tableName: "chats"
        }
)
 
export default Chats

  