import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const ControlQueues = dbPost.define('control_queues', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
        primaryKey: true
        },
        queue_id:{
        type: Sequelize.INTEGER
        },
        lasttime: {
        type: Sequelize.BIGINT,
        defaultValue: null
        },
        status:{
        type: Sequelize.INTEGER,
        defaultValue: 0
        },
        receiver:{
        type: Sequelize.STRING(50)
        },
        company_id:{
            type: Sequelize.INTEGER
        }
},  
{ timestamps: false },
{ createdAt:  false },
{ updatedAt:  false },
{
    freezeTableName: true
    //tableName: "medias"
}
)

export default ControlQueues
