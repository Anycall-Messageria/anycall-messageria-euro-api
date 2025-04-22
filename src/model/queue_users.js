import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const QueueUsers = dbPost.define('queue_users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    creditor_id: {
        type: Sequelize.INTEGER
    },
    user_id: {
        type: Sequelize.INTEGER
    },
    status:{
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    created: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
},

    { timestamps: false },
            { createdAt: false },
            { updatedAt: false },
            {freezeTableName: true }

)

export default QueueUsers