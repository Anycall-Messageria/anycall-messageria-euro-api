import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const User = dbPost.define('users', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING
            },
            login: {
                type: Sequelize.INTEGER
            },
            departament: {
                type: Sequelize.INTEGER
            },
            office: {
                type: Sequelize.INTEGER
            },
            level: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            password: {
                type: Sequelize.STRING
            },
            cpf: {
                type: Sequelize.BIGINT
            },
            email: {
                type: Sequelize.STRING
            },
            user_company:{
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            is_active:{
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            daterecord: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            branchphone:{
                type: Sequelize.INTEGER
            },
            phone_id:{
                type: Sequelize.STRING(100)
            },
            url_profile:{
                type: Sequelize.STRING(150),
                defaultValue: 'sem_título.jpeg'
            },
            reset_password:{
                type: Sequelize.STRING(255),
                defaultValue: null
            }
    },  
        { timestamps: false },
        { createdAt: false },
        { updatedAt: false },
        {
            freezeTableName: true,
        }
    
)

export default User
 


