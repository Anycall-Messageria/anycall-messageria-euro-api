
const justNumbers = (text) => {
    var numbers = text.replace(/[^0-9]/g,'');
    return parseInt(numbers);
}

const transformDate = (datas) => {
    function adicionaZero(numero){
        if (numero <= 9) 
            return "0" + numero
        else
            return numero 
     }
     function adicionaZero(numero){
        if (numero <= 9) 
            return "0" + numero
        else
            return numero 
    }
   let dataAtual = new Date(datas) 
   let dataAtualFormatada = (dataAtual.getFullYear()) + "-" + (adicionaZero(dataAtual.getMonth()+1).toString()) + "-" + adicionaZero(dataAtual.getDate().toString());
    return dataAtualFormatada 
  }
  
  async function formatDateServerSide(d){
    let dataHoraBrasil
    if(!d){
      dataHoraBrasil = null
      return
    }
    let dates = d
    const dataHora = dates;
    const opcoes = {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    };
    const abc = returnDateTimeZone3(dataHora)
    dataHoraBrasil = abc.toLocaleString('pt-BR', opcoes);
    return dataHoraBrasil
  }

  function FormataStringData(data) {
    if(!data) return null
    var dia  = data.split("/")[0];
    var mes  = data.split("/")[1];
    var ano  = data.split("/")[2];
  
    return ano + '-' + ("0"+mes).slice(-2) + '-' + ("0"+dia).slice(-2);
    
  }

  async function dateBetweenNow(){
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
        const startDate = anoF+"-"+mesF+"-"+diaF+" 00:00:01"
        const endDate = anoF+"-"+mesF+"-"+diaF+" 23:59:59";
        const dateBetween = `'${startDate}.001 -0300' and '${endDate}.999 -0300'`
        return dateBetween
  }


  function dataAtualFormatada(){
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
        const horas = data.getHours();
        const minutos = data.getMinutes();
        const segundos = data.getSeconds();
        const milisegundos = data.getMilliseconds();
        const hhmmmss = [horas, minutos, segundos].join(':');
        return anoF+"-"+mesF+"-"+diaF+" "+hhmmmss+"."+milisegundos+" -0300";
  }

async function comparingDates(d){
  const x = new Date(d);
  const dateNow = new Date();
  const dg  = x.getDate();
  const mmg = x.getMonth()+1;
  const ymg = x.getFullYear();
  const hg = x.getHours();
  const mg = x.getMinutes();
  const dn  = dateNow.getDate();
  const mmn = dateNow.getMonth()+1;
  const ymn = dateNow.getFullYear();
  const hn = dateNow.getHours();
  const mn = dateNow.getMinutes();
  //const segundos = x.getSeconds();
  //const milisegundos = x.getMilliseconds();
  let str
  if(dn > dg){
     if(mmn == mmg){
       str = 1
     }
  }else{
    if(mmn > mmg){
     str = 1
    }else{
     str = 0
    }
  }
  return str
}

const returnDateTimeZone3 = (date) => {
  const datas = date ? date : ''
  var targetTime = new Date(datas)
  var timeZoneFromDB = -3.00
  var tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset()
  var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000)
  return offsetTime
}

async function cronRestart(timeLast){
    const lastTime = timeLast
    const seconds1 = Math.floor(new Date(lastTime) / 1000)
    const seconds2 = Math.floor(Date.now() / 1000)
    const cronRestart = (seconds2-seconds1)   
    return cronRestart
  }

async function setHourSeconds(sec){
    const dateObj = new Date(sec * 1000);
    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes();
    const seconds = dateObj.getSeconds();
    const timeString = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    return timeString 
  }
  
  function setHourSeconds1(sec){
    const dateObj = new Date(sec * 1000);
    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes();
    const seconds = dateObj.getSeconds();
    const timeString = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    return timeString 
  }

  
async function getHourPause(time){
    if(!time){
      return '';  
    }
    return time.substring(11, 20);
  }

async function getStringPause(id) {
    let stringPause
    const pauseId = id;
    switch(pauseId) {
        case 1:
            stringPause = 'ALMOÇO'
            break;
        case 2:
            stringPause = 'BANHEIRO'
            break;
        case 3:
            stringPause = 'FEEDBACK'
            break;
        case 4:
            stringPause = 'LANCHE'
            break;
        case 5:
            stringPause = 'SUPERVISÂO'
            break;
        case 6:
            stringPause = 'AGUÁ'
         break;
        case 7:
            stringPause = 'NEGOCIAÇÃO'
        break;
        default: stringPause = "ON-LINE";
    }
      return stringPause
  }

const  rand = (choices) => {
    return (choices[~~(choices.length * Math.random())]);
}

const getRandomArbitrary = (min, max) => {
    let number=  Math.random() * (Math.ceil(max) - Math.ceil(min) + Math.ceil(min))
    return Math.ceil(number)
}

  const greetingMessage = (x) => {
    let h = new Date().getHours()
    let g = rand(x)
    if (h <= 5) return `${g} Boa madrugada.`
    if (h < 12) return `${g} Bom dia.`
    if (h < 18) return `${g} Boa tarde.`
    return `${g} Boa noite.`
}

const comparNumbers = (s, n) => {
    let number = n.toString()
    return s.split(/\W+/).includes(number)
  }
  

const isNumber = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

const returnJustFieldDDD = (phone) => {
  if (phone.length == 13) {
      if (phone.substring(4, 2) <= 30) {
          return phone
      } else {
          let ph = phone.substring(4, 0) + phone.substring(5, phone.length)
          return ph
      }
  }

  if (phone.length == 12) {
      if (phone.substring(4, 2) >= 30) {
        let ph = phone.substring(0, 4) + '9' + phone.substring(4, phone.lengt)
          return ph
          
      } else {
        return phone
      }
  }
}

const justFieldDDD = (phone) => {
    if (phone.length == 13) {
        if (phone.substring(4, 2) <= 30) {
            return phone
        } else {
            let ph = phone.substring(4, 0) + phone.substring(5, phone.length)
            return ph
        }
    }

    if (phone.length == 12) {
        if (phone.substring(4, 2) >= 30) {
            return phone
        } else {
            let ph = phone.substring(0, 4) + '9' + phone.substring(4, phone.lengt)
            return ph
        }
    }
}

const formatPhone = (phone) => {
    let p
    p = justFieldDDD(phone)
    if (p.endsWith('@s.whatsapp.net')) {
        return p
    }
    let formatted = p.replace(/\D/g, '')
    return (formatted += '@s.whatsapp.net')
}



const formatGroup = (group) => {
    if (group.endsWith('@g.us')) {
        return group
    }

    let formatted = group.replace(/[^\d-]/g, '')

    return (formatted += '@g.us')
}


const returnDateTimeZone = (date) => {
    const datas = date ? date : ''
    var targetTime = new Date(datas)
    var timeZoneFromDB = -6.00
    var tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset()
    var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000)
    return offsetTime
}

const returnDateTimeZone2 = (date) => {
    var targetTime = new Date()
    var timeZoneFromDB = -6.00
    var tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset()
    var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000)
    return offsetTime
}

const getdates = (d2) => {
    let str = d2
    let hf = str.substring(11, 19)
    
    let data = new Date();
    let dataFormatada = 
    data.getFullYear()
    + "-0" + 
    ((data.getMonth() + 1)) 
    + "-" + 
    ((data.getDate() )) ; 
    
    return `${dataFormatada} ${hf}.000 -0300`
    }

const validaCpfCnpj = async (val) => {
        if (val.length == 14) {
            var cpf = val.trim();
         
            cpf = cpf.replace(/\./g, '');
            cpf = cpf.replace('-', '');
            cpf = cpf.split('');
            
            var v1 = 0;
            var v2 = 0;
            var aux = false;
            
            for (var i = 1; cpf.length > i; i++) {
                if (cpf[i - 1] != cpf[i]) {
                    aux = true;   
                }
            } 
            
            if (aux == false) {
                return false; 
            } 
            
            for (var i = 0, p = 10; (cpf.length - 2) > i; i++, p--) {
                v1 += cpf[i] * p; 
            } 
            
            v1 = ((v1 * 10) % 11);
            
            if (v1 == 10) {
                v1 = 0; 
            }
            
            if (v1 != cpf[9]) {
                return false; 
            } 
            
            for (var i = 0, p = 11; (cpf.length - 1) > i; i++, p--) {
                v2 += cpf[i] * p; 
            } 
            
            v2 = ((v2 * 10) % 11);
            
            if (v2 == 10) {
                v2 = 0; 
            }
            
            if (v2 != cpf[10]) {
                return false; 
            } else {   
                return true; 
            }
        } else if (val.length == 18) {
            var cnpj = val.trim();
            
            cnpj = cnpj.replace(/\./g, '');
            cnpj = cnpj.replace('-', '');
            cnpj = cnpj.replace('/', ''); 
            cnpj = cnpj.split(''); 
            
            var v1 = 0;
            var v2 = 0;
            var aux = false;
            
            for (var i = 1; cnpj.length > i; i++) { 
                if (cnpj[i - 1] != cnpj[i]) {  
                    aux = true;   
                } 
            } 
            
            if (aux == false) {  
                return false; 
            }
            
            for (var i = 0, p1 = 5, p2 = 13; (cnpj.length - 2) > i; i++, p1--, p2--) {
                if (p1 >= 2) {  
                    v1 += cnpj[i] * p1;  
                } else {  
                    v1 += cnpj[i] * p2;  
                } 
            } 
            
            v1 = (v1 % 11);
            
            if (v1 < 2) { 
                v1 = 0; 
            } else { 
                v1 = (11 - v1); 
            } 
            
            if (v1 != cnpj[12]) {  
                return false; 
            } 
            
            for (var i = 0, p1 = 6, p2 = 14; (cnpj.length - 1) > i; i++, p1--, p2--) { 
                if (p1 >= 2) {  
                    v2 += cnpj[i] * p1;  
                } else {   
                    v2 += cnpj[i] * p2; 
                } 
            }
            
            v2 = (v2 % 11); 
            
            if (v2 < 2) {  
                v2 = 0;
            } else { 
                v2 = (11 - v2); 
            } 
            
            if (v2 != cnpj[13]) {   
                return false; 
            } else {  
                return true; 
            }
        } else {
            return false;
        }
     }

function removerCaracteresEspeciais(string) {
        return string.replace(/[^a-zA-Z0-9]/g, "");
}

async function isNumeric(str) {
        var er = /^[0-9]+$/;
        return (er.test(str));
}

async function removerNumeros(string) {
    return string.replace(/[^a-zA-Z]/g, "");
}

const verifyCpfIsNumbersOnly = async (value) => {
  if(value){
    const remove = await removerNumeros(value)
        if(remove){
            console.log(remove.length)
            const exists = await isNumeric(remove);
            console.log(exists)
            if (!exists){
            return false
            } 
        }
  }
}

function getBranchs(number){
    //console.log(typeof(number))
    const n = number
    let aging
    if(typeof(n) == "number"){
      if(n == 1){
        aging = 'aguas_claras';
      }else if(n == 2){
        aging = 'balneario_camboriu';
      }else if(n == 3){
        aging = 'blumenau';
      }else if(n == 4){
        aging = 'brusque';
      }else if(n == 5){
        aging = 'dom_joaquim';
      }else if(n == 6){
        aging = 'florianopolis';
      }else if(n == 7){
        aging = 'itajai';
      }else if(n == 8){
        aging = 'jaragua';
      }else if(n == 9){
        aging = 'joinville_centro'; 
      }else if(n == 10){
        aging = 'joinville_costasilva'; 
      }else if(n == 11){
        aging = 'sao_jose'; 
      }else if(n == 12){
      aging = 'camboriu'; 
    }
    
    }
    if(typeof(n) == "string"){
      if(n == 'aguas_claras'){
        aging = 1;
      }else if(n == 'balneario_camboriu'){
        aging = 2;
      }else if(n == 'blumenau'){
        aging = 3;
      }else if(n == 'brusque'){
        aging = 4;
      }else if(n == 'dom_joaquim'){
        aging = 5;
      }else if(n == 'florianopolis'){
        aging = 6;
      }else if(n == 'itajai'){
        aging = 7;
      }else if(n == 'jaragua'){
        aging = 8;
      }else if(n == 'joinville_centro'){
        aging = 9; 
      }else if(n == 'joinville_costasilva'){
        aging = 10; 
      }else if(n == 'sao_jose'){
        aging = 11; 
      }else if(n == 'camboriu'){
        aging = 12; 
      }
    }
    return aging
}

function dayActualy(){
  const date = new Date();
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate
}


async function splitArray(a){
  const statusOocorrencias = a
  let text = ``
  let str2 = ``
  if(typeof(a) == 'object'){
    for (let i = 0; i < statusOocorrencias.length; i++) {
      text += statusOocorrencias[i] + ",";
    } 
    const str = text
    str2 = str.substring(0, str.length - 1);
  }else{
    str2 = statusOocorrencias
  }
  return str2
}

function dataAtualFormatadas(time){
  let r
  var data = new Date(),
  dia  = data.getDate().toString(),
  diaF = (dia.length == 1) ? '0'+dia : dia,
  mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
  mesF = (mes.length == 1) ? '0'+mes : mes,
  anoF = data.getFullYear();
  const horas = data.getHours();
  const minutos = data.getMinutes();
  const segundos = data.getSeconds();
  const milisegundos = data.getMilliseconds();
  const hhmmmss = [horas, minutos, segundos].join(':');
  if(time == 'start'){
      r = anoF+"-"+mesF+"-"+diaF+" 00:00:01.000 -0300";
  }else{
      r = anoF+"-"+mesF+"-"+diaF+" 23:59:59.000 -0300";
  }
  return r
}

function generateDatabaseDateTime(date){
  var data = date,
      dia  = data.getDate().toString(),
      diaF = (dia.length == 1) ? '0'+dia : dia,
      mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
      mesF = (mes.length == 1) ? '0'+mes : mes,
      anoF = data.getFullYear();
      const horas = (data.getHours() < 10) ? 0+(data.getHours()).toString() : data.getHours().toString()
      const minutos = (data.getMinutes() < 10) ? 0+(data.getMinutes()).toString() : data.getMinutes().toString() 
      const segundos = (data.getSeconds() < 10) ? 0+(data.getSeconds()).toString() : data.getSeconds().toString()  
      let milisegundos
      if(data.getMilliseconds() < 10){
          milisegundos = '00'+(data.getMilliseconds()).toString() 
      }else if(data.getMilliseconds() < 100){
          milisegundos = '0'+(data.getMilliseconds()).toString() 
      }else{
          milisegundos = data.getMilliseconds().toString()   
      }
             const hhmmmss = [horas, minutos, segundos].join(':');
      return anoF+"-"+mesF+"-"+diaF+" "+hhmmmss+"."+milisegundos+" -0300";
}



async function cleanOcorrences(a){
  const ocorrencias = a
  const result = ocorrencias.split(',');
  let newOcorrencias = {}
  if(result[0] == '0'){
    if(result.length == 1 && result[0] == '0'){
      newOcorrencias =  {o: '', s: false }
    }else{
     newOcorrencias =  {o: ocorrencias.replace('0,', ''), s: true }
    }
  }else{
   newOcorrencias = {o: ocorrencias, s: false }
  }
  return newOcorrencias
}


function DateNow (x){
  let w 
	const r = (z) =>{
  	if(parseInt(z) < 10){
      w = '0'+z   
    }else{
      w = z
    }
    return w
  }
  const y = x.getFullYear()
  const m = x.getMonth()
  const d = x.getDate()
  return `${y}-${r(m+1)}-${d}`
}

function searchString(str){ return str.match(/,/) ? true : false }

function replaceValue(v){
        const p = v;
        const x = p.replace('.', '')
        const t = x.replace(',', '.');
        return t
}

function formatDateClientSide(d){
  const dataInput = d
  const dataServer = new Date(dataInput);
  const dataFormatada = dataServer.toLocaleDateString('pt-BR', {timeZone: 'UTC'});
  return dataFormatada
}


function formatDate() {
  var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}


function capitalizeFirstLetter(string) {
  const mini = string.toLowerCase() 
  return mini.charAt(0).toUpperCase() + mini.slice(1);
}


function findString (string, w){
  let text = string
  let word = w
  return (text.indexOf(word) !== -1) 
}

export { validaCpfCnpj , isNumeric, verifyCpfIsNumbersOnly ,
    getdates, transformDate, justNumbers, rand, getRandomArbitrary, greetingMessage, 
    comparNumbers, isNumber, formatPhone , formatGroup, returnDateTimeZone, returnDateTimeZone2,
     getStringPause, dataAtualFormatada, FormataStringData, getBranchs, 
    formatDateServerSide, dateBetweenNow, comparingDates, returnDateTimeZone3,
    getHourPause, setHourSeconds, setHourSeconds1 , cronRestart, dayActualy, splitArray , DateNow,
    dataAtualFormatadas , generateDatabaseDateTime, cleanOcorrences, replaceValue, formatDateClientSide,
    searchString , capitalizeFirstLetter, findString, returnJustFieldDDD }

