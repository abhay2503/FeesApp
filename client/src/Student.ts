export interface Student{
    Studentid:string,
    StudentName:string,
    StudentClass:string,
    StudentSubject:string, 
    StudentDoj:Date, 
    StudentFeesCycle:string,
    StudentFees:number
    StudentIsDelist:string
}


export interface StudentInput {
    Studentid: string;
    StudentName: string;
    StudentDoj: Date;
    StudentFees: number;
    StudentClass: string;
    StudentFeesCycle: string;
    StudentSubject: string;
  }


  export interface SubjectInput {
    Physics:boolean
    Chemistry: boolean,
    Computer:boolean,
    Maths: boolean,
    Accounts: boolean,
    Economics: boolean,
    English: boolean,
    Biology:boolean,
    SST: boolean,
  }

  export interface StudentFees{
    id:string,
    Studentid:string,
    StudentName:string,
    StudentClass:string,
    StudentFees:number,
    FeesPaid:number, 
    month:number, 
    year:number,
    payDate:Date,
    payStatus:string
}


export interface FeesDetails{
  id:string,
  StudentName:string,
  StudentFees:number
}

