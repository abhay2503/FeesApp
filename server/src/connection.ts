import mysql from 'mysql2/promise';


const connection=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'Abhay@123',
    database:'studentfees'
});

  
  export default connection;
  