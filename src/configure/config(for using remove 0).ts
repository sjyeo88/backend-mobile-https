export interface setInputInterface {
  host:string,
  user:string,
  password:string,
  port:number,
  database:string
}

export class ServerConfig {

  jwt_password:string
  dbSetting:setInputInterface = {
    host: '',
    user: '',
    password: '',
    port: 3306,
    database: 'USER',
  }
  constructor() {
    this.jwt_password = 'test'
  }
}


// var configs={
//   // host:"localhost",
//   // password:process.env.SERVER_PASSWORD,
//   host:"182.162.104.243",
//   password:'!dutkak3',
//   user:"root",
//   port:3306,
//   database:"USER"
// }
