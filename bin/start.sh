#! /bin/sh
if [! -f "pid"]
	then
	node ../lib/daemon.js ../conf/config &
	echo  $! > pid
fi