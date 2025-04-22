import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const NewMobiles =  dbPost.define('new_mobiles', {
        id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
        name: {
                type: Sequelize.STRING(30)
            },
        device: {
             type: Sequelize.STRING(60)
        },
        mac: {
            type: Sequelize.STRING(60)
        },
        status:{
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        created: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        },
        obs:{
            type: Sequelize.STRING(600)
         },
        },  
        { timestamps: false },
        { createdAt:  false },
        { updatedAt:  false },
        {
            freezeTableName: true
        }
)

/*
    0 standby
    1 disconnected
    2 connection
    3 block
    4 request
    5 unlock
    9 banned
*/

const NumbersOperators =  dbPost.define('numbers_operators', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    number:{
        type: Sequelize.BIGINT
    },
    operator:{
        type: Sequelize.INTEGER
    },
    type:{
        type: Sequelize.INTEGER
    },
    creditor:{
        type: Sequelize.DECIMAL(10,2)
     },
    account_due_date:{
        type: Sequelize.DATEONLY
    },
    status: {
        type: Sequelize.INTEGER
    },
    activation:{
        type: Sequelize.DATEONLY
    },
    mobileId: {
        type: Sequelize.INTEGER,
        references: {
          model: NewMobiles,
          key: 'id',
        },
    },
    created: {
       type: Sequelize.DATE,
         defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
    account_type:{
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    obs:{
          type: Sequelize.STRING(600)
    },
    },  
    { timestamps: false },
    { createdAt:  false },
    { updatedAt:  false },
    {
        freezeTableName: true
    }
)

const NewMovingDevices =  dbPost.define('new_moving_devices', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    moving:{
        type: Sequelize.INTEGER
    },
    moving_date:{
        type: Sequelize.DATEONLY
    },
    numberOperatorId: {
        type: Sequelize.INTEGER,
        references: {
          model: NumbersOperators,
          key: 'id',
        },
    },
    created: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
    },  
    { timestamps: false },
    { createdAt:  false },
    { updatedAt:  false },
    {
        freezeTableName: true
    }
)

NewMobiles.hasMany(NumbersOperators);
NumbersOperators.hasMany(NewMovingDevices);
 
export { NewMobiles , NumbersOperators, NewMovingDevices }



