import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const CampaingSms = dbPost.define('campaings_sms', {
      id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
      },
      phone_number: {
        type: Sequelize.STRING(11)
      },
      stats: {
          type: Sequelize.INTEGER,
          defaultValue: 0
      },
      queue_id: {
          type: Sequelize.INTEGER
      },
      send: {
          type: Sequelize.DATE
      }
},  
    { timestamps: false },
    { createdAt: false },
    { updatedAt: false },
    {
      freezeTableName: true,
    }
)

export default CampaingSms