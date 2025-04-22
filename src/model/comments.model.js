import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Comment =  dbPost.define('comments', {
    id: {
           type: Sequelize.INTEGER,
           autoIncrement: true,
           allowNull: false,
           primaryKey: true
       },
       name: {
        type: Sequelize.STRING
      },
      text: {
        type: Sequelize.STRING
      },
      company_id:{
        type: Sequelize.INTEGER
    }
},  
   { timestamps: false },
   { createdAt:  false },
   { updatedAt:  false },
   {
       freezeTableName: true,
       //tableName: "tags"
   }
)

export default Comment