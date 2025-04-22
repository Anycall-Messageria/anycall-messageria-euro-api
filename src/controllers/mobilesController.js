import response from '../../response.js'
import { NewMobiles } from '../model/newMobiles.model.js'

async function list(req, res) {
    try {
        const query = `Select m.id, m."number", m.device, m.mac, TO_CHAR(m.registration, 'DD/MM/YYYY') as registration, 
                        m.telephone_operator as id_telephone_operator,
                        too.description as telephone_operator,
                        m.wpp_type as id_wpp_type,
                        wt.description as wpp_type,	
                        mdv.moving as id_moving,
                        dvm.description as moving,
                        mdv.moving_date,
                        TO_CHAR(mdv.moving_date, 'DD/MM/YYYY') as moving_date
                        from mobiles m
                        inner join vw_moving_devices mdv on mdv."mobileId" = m.id 
                        inner join device_movings dvm on dvm.id = mdv.moving 
                        inner join telephone_operators too on too.id = m.telephone_operator 
                        inner join wpp_types wt on wt.id = m.wpp_type
                        order by m.id asc;`
        const datas = await NewMobiles.findAll({ order: [['id', 'ASC']]})
        response(res, 200, true, 'List Mobiles', datas)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

async function add(req, res) {
    try {
        const findId = await NewMobiles.findOne({ order: [['id', 'desc']]})
        const id = (findId.id + 1)
        const { name, device, mac, obs } = req.body
        const values = { id, name, device, mac, obs }
        const mob = await NewMobiles.create(values)
        response(res, 200, true, 'create success', mob)
    } catch (err) {
        response(res, 500, false, 'server application error.', err)
    }
}

async function update(req, res) {
    try {
        const { id, name, device, mac, obs } = req.body
            const values = {name, device, mac, obs}
            const mob = await NewMobiles.update( values, {where: {id}},{ multi: true})
            response(res, 200, true, 'update success', mob)
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
        response(res, 200, true, 'delete success', {id})
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}


export { list, add, update, del}