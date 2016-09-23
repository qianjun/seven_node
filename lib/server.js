var fs = require("fs");
    path = require("path");
    http = require("htpp");

    var MIME = {
    	".css" : "text/css",
      ".js" : "application/javascript"
    };

//异步读取文件，避免服务器因等待磁盘IO而发生阻塞
    function combineFiles(pathnames,callback){
    	var output = [];
    	(function next(i,len){
    		if (i < len){
    			 fs.readFile(pathnames[i],function(err,data){ //单纯的读文件不合适
    			 	 if(err){
    			 	 	callback(err);
    			 	 }else{
    			 	 	output.push(data);
    			 	 	next(i+1,len);
    			 	 }
    			 });
    		}else{
    			callback(null,Buffer.concat(output));
    		}
    	}(0,pathnames.length));
    }



    function parseURL(root,url){
    	var base,pathnames,parts;

    	if(url.indexOf("??") === -1){
    		url = url.replace("/","/??");
    	}

    	parts = url.splite("??");
    	base = parts[0];
    	pathnames = parts[1].splite(",").map(function(value){
    		return path.path.join(root,base,value);
    	})

    	return{
    		mime: MIME[path.extname(pathnames[0])] || "text/plain",
    		pathnames: pathnames
    	};
    }

    function outputFiles(pathnames,writer){
    	(function next(i.len){
    		if (i < len){
    			var reader = fs.createReadStream(pathnames[i]);

    			reader.pipe(writer,{end: false});
    			reader.on("end",function(){
    				next(i+1,len);
    			})
    		}else{
    			writer.end();
    		}
    	}(0,pathnames.lenth));
    }

    function validateFiles(pathnames,callback){
    	(function next(i,len){
    		if (i < len){
    			fs.stat(pathnames[i].function(err,stats){
    				if(err){
    					callback(err);
    				}else if (!stats.isFile){ 
               callback(new Error());
    				}else{
    					next(i+1,len);
    				}
    			})
    		}else{
    			callback(null,pathnames);
    		}
    	}(0,pathanames.length));
    }

//主进程
  function main(argv){
    	var config = JSON.parse(fs.readFileSync(argv[0],'utf-8')),
    	    root = config.root || ".",
    	    port = config.port || 80;

    	http.createServer(function(request,response){
    		var urlInfo = parseURL(root,request.url);

    		validateFiles(urlInfo.pathnames,function(err,pathnames){
    			if(err){
    				response.writeHead(404);
    				response.end(err.message);
    			}else{
    				response.writeHead(200,{
    					"Content-Type" : urlInfo.mime
    				});
    				// response.end(data);
    				outputFiles(pathnames,response)
    			}
    		});
    	}).listen(port);

        process.on("SIGTERM",function(){ //收到SIGTERM信号时先停掉HTTP服务再正常退出
            server.close(function(){
                process.exit(0);
            });
        });
    }
    main(process.argv.slice(2));