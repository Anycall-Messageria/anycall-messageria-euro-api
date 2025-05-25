import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const QueueSms = dbPost.define('queue_sms', {
      id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
      },
      credor: {
        type: Sequelize.INTEGER
      },
      nome_campanha: {
          type: Sequelize.STRING(255)
      },
      message: {
          type: Sequelize.STRING(160)
      },
      start: {
          type: Sequelize.DATE
      },
      end: {
        type: Sequelize.DATE
      },
      registros: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      entregues: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      falhas: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      }
},  
    { timestamps: false },
    { createdAt: false },
    { updatedAt: false },
    {
      freezeTableName: true,
    }
)

export default QueueSms