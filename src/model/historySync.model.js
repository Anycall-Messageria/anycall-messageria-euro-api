import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const HistorySync = dbPost.define('history_syncs', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    sync_type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
    total_chats: {
        type: Sequelize.INTEGER
    },
    total_contacts: {
        type: Sequelize.INTEGER
    },
    total_messages: {
        type: Sequelize.INTEGER
    },
    session_id: {
        type: Sequelize.STRING
    },
    company_id: {
        type: Sequelize.INTEGER
    }
}, {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    freezeTableName: true
})

export default HistorySync 