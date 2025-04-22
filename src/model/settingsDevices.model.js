import { DATEONLY, Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const TelephoneOperators =  dbPost.define('telephone_operators', {
        id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
        },
        description: {
                type: Sequelize.STRING(25)
        },
        status:{
            type: Sequelize.INTEGER,
            defaultValue: 0
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

const WppTypes =  dbPost.define('wpp_types', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        description:{
            type: Sequelize.STRING(25)
        },
        status:{
            type: Sequelize.INTEGER,
            defaultValue: 0
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

const TypeAccountOperators =  dbPost.define('type_account_operators', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    description:{
        type: Sequelize.STRING(25)
    },
    status:{
        type: Sequelize.INTEGER,
        defaultValue: 0
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

const DeviceMovings =  dbPost.define('device_movings', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    description:{
        type: Sequelize.STRING(25)
    },
    status:{
        type: Sequelize.INTEGER,
        defaultValue: 0
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


const numberTypeChip =  dbPost.define('number_type_chips', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            description:{
                type: Sequelize.STRING(25)
            },
            status:{
                type: Sequelize.INTEGER,
                defaultValue: 0
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


export { TelephoneOperators , WppTypes, TypeAccountOperators, DeviceMovings, numberTypeChip}

