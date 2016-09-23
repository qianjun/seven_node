var cp = require("child_process");

var worker;
 //启动服务器进程并监控服务器进程
function spawn(server,config){
	worker = cp.spawn("node",[server,config]);
	worker.on("exit"，function(code){
		if (code !== 0){
			spawn(server,config);
		}
	});
}

function main(argv){
	spawn("server.js",argv[0]); //启动服务器进程
	process.on("SIGTERM",function(){ //让守护进程在接收到SIGTERM信号时终止服务器进程
		worker.kill();
		process.exit(0);
	});
}

main(process.argv.slice(2));
