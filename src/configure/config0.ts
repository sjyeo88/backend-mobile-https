//Remove 0 on file names

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
