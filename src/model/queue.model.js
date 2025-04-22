import { Sequelize } from "sequelize"
import dbPost from '../../database/dbPostgresClient.js'
import { returnDateTimeZone2 } from '../utils/util.js'


async function getDate() {
  let date = returnDateTimeZone2()
  const workingDays = date.getDay()
  return workingDays    
}

const Queues = dbPost.define('queues', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            credor: {
                type: Sequelize.INTEGER
            },
            nomefila: {
                type: Sequelize.STRING
            },
            identificador: {
                type: Sequelize.STRING
            },
            datainicial: {
                type: Sequelize.DATE
            },
            datafinal: {
                type: Sequelize.DATE
            },
            rota: {
                type: Sequelize.STRING
            },
            tipomidia: {
                type: Sequelize.INTEGER
            },
            midia: {
                type: Sequelize.STRING
            },
            captionmidia: {
                type: Sequelize.STRING
            },
            tipomensagem: {
                type: Sequelize.INTEGER
            },
            mensageminicial: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            mensagem: {
                type: Sequelize.STRING(800)
            },
            created: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 5
            },
            minTime: {
                type: Sequelize.INTEGER
            },
            maxTime: {
                type: Sequelize.INTEGER
            },
            entregues: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            falhas: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            registros: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            urlmidia: {
                type: Sequelize.STRING
            },
            title: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.STRING
            },
            btnFooter: {
                type: Sequelize.STRING
            },
            urlBtnDisplayText: {
                type: Sequelize.STRING
            },
            urlBtnUrl: {
                type: Sequelize.STRING
            },
            callBtnDisplayText: {
                type: Sequelize.STRING
            },
            callBtnPhoneNumber: {
                type: Sequelize.STRING
            },
            quickReplyBtnDisplayText: {
                type: Sequelize.STRING
            },
            quickReplyBtnId: {
                type: Sequelize.STRING
            },
            randomica: {
              type: Sequelize.STRING
            },
            banremove: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            schedule: {
                type: Sequelize.INTEGER,
                defaultValue: 5
            },
            massiva: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            altertimers:{
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            sunday:{
                type: Sequelize.INTEGER,
                defaultValue: await getDate()
            },
            company_id:{
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            filtro: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            company_id:{
                type: Sequelize.INTEGER
            },
            messages_id:{
                type: Sequelize.STRING(100)
            },
            msginit_id:{
                type: Sequelize.STRING(100)
            },
            product:{
                type: Sequelize.INTEGER
            }
    },  
        { timestamps: false },
        { createdAt:  false },
        { updatedAt:  false },
        {
            freezeTableName: true
            //tableName: "medias"
        }
)
 
export default Queues
