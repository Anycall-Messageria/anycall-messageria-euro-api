import { DATEONLY, Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const Mobiles =  dbPost.define('mobiles', {
        id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
        number: {
                type: Sequelize.STRING(11)
            },
        device: {
             type: Sequelize.STRING(60)
        },
        mac: {
            type: Sequelize.STRING(60)
        },
        registration:{
            type: Sequelize.DATEONLY
        },
        telephone_operator:{
            type: Sequelize.INTEGER
        },
        wpp_type:{
            type: Sequelize.INTEGER
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

/*
    0 standby
    1 disconnected
    2 connection
    3 block
    4 request
    5 unlock
    9 banned
*/
const MovingDevices =  dbPost.define('moving_devices', {
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
    mobileId: {
        type: Sequelize.INTEGER,
        references: {
          model: Mobiles,
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

const AccountPlanes =  dbPost.define('account_planes', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    type_account:{
        type: Sequelize.INTEGER
    },
    due_date:{
        type: Sequelize.DATEONLY
    },
    invoice_value:{
       type: Sequelize.DECIMAL(10,2)
    },
    mobileId: {
        type: Sequelize.INTEGER,
        references: {
          model: Mobiles,
          key: 'id',
        },
      },
    },  
    { timestamps: false },
    { createdAt:  false },
    { updatedAt:  false },
    {
        freezeTableName: true
    }
)

Mobiles.hasMany(MovingDevices);
Mobiles.hasMany(AccountPlanes);
 
export { Mobiles , MovingDevices, AccountPlanes }



