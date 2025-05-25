import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'
import HistorySync from './historySync.model.js'

const ChatsHistory = dbPost.define('chats_history', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING
    },
    last_sync_id: {
        type: Sequelize.INTEGER,
        references: {
            model: HistorySync,
            key: 'id'
        }
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

ChatsHistory.belongsTo(HistorySync, { foreignKey: 'last_sync_id' })

export default ChatsHistory 