
import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Ultiimatesession = dbPost.define('ultiimatesessions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            lastsessionid: {
                type: Sequelize.INTEGER
            },
            daterecord: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            lastcountid: {
                type: Sequelize.INTEGER
            },
            idcampaing:{
                type: Sequelize.INTEGER
            },
            laststates:{
                type: Sequelize.INTEGER,
                defaultValue: 0
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
/*
  User.associate = (models) => {
    User.hasOne(Receita,
      { foreignKey: 'negociador_id',  targetKey: 'id' });
  }
*/
export default Ultiimatesession
 





