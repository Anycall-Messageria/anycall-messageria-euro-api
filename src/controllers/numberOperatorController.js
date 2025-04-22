import response from '../../response.js'
import database from '../../database/dbPostgresClient.js'
import { QueryTypes , Op} from "sequelize"
import { NumbersOperators, NewMovingDevices } from '../model/newMobiles.model.js'

async function list(req, res) {
    try {
        const query = `select no.id, no."number", no."operator", th.description as operator_name, 
                        no."type", ntc.description as chip_types, no.creditor, no.account_due_date,
                        no.status, no.activation, no."mobileId", no.account_type, tac.description as account_types,
                        nm."name", nm.device, mdv.moving as moving_id, dvm.description as moving_description
                        from numbers_operators no
                        left join new_mobiles nm on nm.id = no."mobileId" 
                        left join telephone_operators th ON th.id = no."operator" 
                        left join vw_moving_devices mdv on mdv."numberOperatorId" = no.id 
                        left join device_movings dvm on dvm.id = mdv.moving 
                        left join type_account_operators tac ON tac.id = no."account_type" 
                        left join number_type_chips ntc on ntc.id = no."type" where no.status = 1 order by no.id asc;`
        const datas = await database.query(query, { type: QueryTypes.SELECT });
        response(res, 200, true, 'List number operators', datas)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

async function listBanned(req, res) {
    try {
        const query = `select no.id, no."number", no."operator", th.description as operator_name, 
                        no."type", ntc.description as chip_types, no.creditor, no.account_due_date,
                        no.status, no.activation, no."mobileId", no.account_type, tac.description as account_types,
                        nm."name", nm.device, mdv.moving as moving_id, dvm.description as moving_description
                        from numbers_operators no
                        left join new_mobiles nm on nm.id = no."mobileId" 
                        left join telephone_operators th ON th.id = no."operator" 
                        left join vw_moving_devices mdv on mdv."numberOperatorId" = no.id 
                        left join device_movings dvm on dvm.id = mdv.moving 
                        left join type_account_operators tac ON tac.id = no."account_type" 
                        left join number_type_chips ntc on ntc.id = no."type" where no.status = 0 order by no.id asc;`
        const datas = await database.query(query, { type: QueryTypes.SELECT });
        response(res, 200, true, 'List number operators banned', datas)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}


async function add(req, res) {
    try {
        const findId = await NumbersOperators.findOne({ order: [['id', 'desc']]})
        const i = findId ? (findId.id + 1) : 13
        const id = i
        const { number, telephone_operator  , type, creditor, account_due_date, activation , mobileId, obs} = req.body
        const values = {  id, number, operator: telephone_operator, type, creditor, account_due_date, activation , mobileId, obs }
        const numb = await NumbersOperators.create(values)
        response(res, 200, true, 'create success', numb)
     } catch (err) {
         response(res, 500, false, 'server application error.', err)
     }
}

async function update(req, res) {
    try {
            const { id, number, mobileId, telephone_operator, type, activation,  account_type, account_due_date, creditor, obs} = req.body
            const values = { telephone_operator,  mobileId, account_type, account_due_date, creditor, obs}
            const numb = await NumbersOperators.update(values, {where: {id: id}},{ multi: true})
            response(res, 200, true, 'create success', numb)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

async function del(req, res) {
    try {
        const id = req.params.id
        console.log('Id to delete record in the database...', id)
        const datas = await MobilesController.destroy({where: {id: id}})
        response(res, 200, true, 'Item deleted successfully!', datas)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}


async function movingDevices(req, res) {
    try {
        const { moving_number, moving_date, phoneIdMoving} = req.body
        const findId = await NewMovingDevices.findOne({ order: [['id', 'desc']]})
        const id = (findId.id + 1)
        const values = {  id: id, moving: parseInt(moving_number), moving_date: moving_date, numberOperatorId: parseInt(phoneIdMoving) }
        await NewMovingDevices.create(values)
        if(moving_number == 7){
            const condition = { where :{ id: parseInt(phoneIdMoving) } } 
            const options = { multi: true }
            const values = { status: 0}
            await NumbersOperators.update(values, condition , options)
        }
        response(res, 200, true, 'Item inserted successfully!', values)
    } catch (err) {
        response(res, 500, false, 'server application error.', err)
    }
}

export { list, add, update, del, movingDevices, listBanned}