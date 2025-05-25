import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'
import HistorySync from './historySync.model.js'
import ChatsHistory from './chatsHistory.model.js'
import ContactsHistory from './contactsHistory.model.js'

const MessagesHistory = dbPost.define('messages_history', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    chat_id: {
        type: Sequelize.STRING,
        references: {
            model: ChatsHistory,
            key: 'id'
        }
    },
    sender_id: {
        type: Sequelize.STRING,
        references: {
            model: ContactsHistory,
            key: 'id'
        }
    },
    content: {
        type: Sequelize.TEXT
    },
    timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
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

MessagesHistory.belongsTo(HistorySync, { foreignKey: 'last_sync_id' })
MessagesHistory.belongsTo(ChatsHistory, { foreignKey: 'chat_id' })
MessagesHistory.belongsTo(ContactsHistory, { foreignKey: 'sender_id' })

export default MessagesHistory 