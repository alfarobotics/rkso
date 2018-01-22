var pos_server = {
	host: '127.0.0.1',
	port: 6969
};

function make_rpc_result(id, result){
	var rpc = {
		"jsonrpc": "2.0",
	}
	if (typeof result !== "undefined") {
		rpc.result = result;
	}
	rpc.id = id;
	return JSON.stringify(rpc);
}
function make_rpc_error(id, error){
	var rpc = {
		"jsonrpc": "2.0",
	}
	if (typeof error !== "undefined") {
		rpc.error = error;
	}
	rpc.id = id;
	return JSON.stringify(rpc);
}

const net = require('net');

function start(){
	var client = net.createConnection(pos_server, () => {
		//'connect' listener
		console.log(new Date(), 'POS connected to rpc server: ' + pos_server.host + ":" + pos_server.port);
	});
	client.on('data', (data) => {
		var request = data.toString();
		var rpc = JSON.parse(request);
		var response = get_answer(rpc);
		console.log(response);
		client.write(response);
		
		//client.end();
	});
	client.on('error', (e) => {
		console.log('error', e);
		setTimeout(start, 100);
	});
	client.on('end', () => {
		console.log('POS disconnected from rpc server');
		setTimeout(start, 100);
	});
}
start();


function get_answer(rpc){
	var answer = "";
	switch (rpc.method) {
	case 'init' :
		answer = make_rpc_result(rpc.id,
			{
				"successful" : true
			}
		);
		break;
	case 'get_info' :
		answer = make_rpc_result(rpc.id,
			{
				"proto_version": "1.0",
				"cash_number": 1,
				"pos_version": "1.2.3",
				"auth_type": "PLAIN"
			}
		);
		break;
	case 'get_status' :
		answer = make_rpc_result(rpc.id,
			{
				"status": "READY"
			}
		);
		//CLOSED Смена закрыта
		//READY Готов к началу покупки
		//BUYING Открытая покупка
		//LOCKED Работа остановлена администратором
		//ERROR Ошибка, неготовность к работе
		break;
	case 'check_login' :
		if(rpc.params.hasOwnProperty('username')){
			
		}else if(rpc.params.hasOwnProperty('barcode')){
			
		}else{
			answer = make_rpc_error(rpc.id,
				{
					"code" : 1
				}
			);
		}
		break;
	case 'login' :
		answer = make_rpc_result(rpc.id,
			{
				"successful" : true,
				"access_level" : 1,
				"message" : ""
			}
		);
		break;
		
		
		
		
	default :
		answer = make_rpc_error(rpc.id,
			{
				"code" : 1,
				"message" : "Дождитесь консультанта",
				"data" : {
					"detail_message" : "Отсутствует чековая лента.",
					"iv_class" : "CASH_REG_ERROR"
				}
			}
		);
	}
	return answer;
}