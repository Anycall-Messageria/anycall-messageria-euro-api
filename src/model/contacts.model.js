
import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Contact = dbPost.define('contacts', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING
            },
            verifiedName: {
                type: Sequelize.STRING
            },
            profileUrl: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            remotejid: {
                type: Sequelize.BIGINT
            },
            daterecord: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
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
export default Contact
 





