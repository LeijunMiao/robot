module.exports = {
    service: 'ws://localhost:3001/',
    mmsql: {
		host: '118.178.121.39', // //118.178.121.39 192.168.93.163
		//port: 1433,
		pool: {
			max: 1000,
			min: 0,
			idle: 10000
		},
		dialect:'mssql'
	},
	db: 'robot', //DS_ETL_SHSN DS_EOC_SHSN_ETL ds_eoc_sn
	username: 'robot', //sa
    pwd: 'robotrobotrobot' //1qaz@WSX
};