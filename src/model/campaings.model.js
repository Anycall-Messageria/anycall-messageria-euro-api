import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Campaing = dbPost.define('campaings', {
      id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
      },
      identificador: {
        type: Sequelize.STRING
      },
      number: {
          type: Sequelize.STRING
      },
      var1: {
          type: Sequelize.STRING
      },
      var2: {
          type: Sequelize.STRING
      },
      var3: {
        type: Sequelize.STRING
      },
      var4: {
        type: Sequelize.STRING
      },
      var5: {
        type: Sequelize.STRING
      },
      var6: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      statusSend: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      stateMsg: {
        type: Sequelize.STRING
      },
      sendmessageinitial: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      session: {
        type: Sequelize.BIGINT
      },
      active: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      schedule: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      altertimers:{
         type: Sequelize.INTEGER,
         defaultValue: 0
      },
      var7: {
        type: Sequelize.STRING
      },
      var8: {
        type: Sequelize.STRING
      },
      var9: {
        type: Sequelize.STRING
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

export default Campaing