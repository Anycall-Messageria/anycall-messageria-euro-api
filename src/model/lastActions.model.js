import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'

const LastActions = dbPost.define('last_actions', { 
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        acion_id: {
            type: Sequelize.INTEGER
        },
        cpf_phone: {
            type: Sequelize.BIGINT
        },
        filial_acio: {
            type: Sequelize.INTEGER
        },
        ocorrencia_id_acio:{
            type: Sequelize.INTEGER
        },
        data_acionamento_acio: {
            type: Sequelize.DATE
        },
        data_agenda_acio: {
            type: Sequelize.DATE
        },
        /*
        mensagem_acio: {
            type: Sequelize.STRING(600)
        },
        fone_acio: {
            type: Sequelize.STRING(12)
        },
        */
        atraso_acio: {
            type: Sequelize.INTEGER
        },
        tipo_acionamento_acio: {
            type: Sequelize.INTEGER
        },
        duracao_acio: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        usuario_inclusao_acio: {
            type: Sequelize.INTEGER
        },
        /*
        status: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        company_id:{
            type: Sequelize.INTEGER
        }
        */
    },
    { timestamps: false },
    { createdAt:  false },
    { updatedAt:  false },
    {
      freezeTableName: true,
      indexes: [
        // A BTREE index with an ordered field
        /*{
          name: 'last_actions_acion_id_idx',
          using: 'BTREE',
          fields: [
            'acion_id',
            'cpf_phone'
          ]
        },*/
        {
          unique: false,
          name: 'last_actions_acion_id_idx',
          fields: ['acion_id', 'cpf_phone']
        },
      ]
    });

  export default LastActions