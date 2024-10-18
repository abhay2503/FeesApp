import express, { NextFunction, Request, Response } from 'express';
// import cors from 'cors';
import connection from './connection';
import path from 'path';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { FieldPacket, OkPacketParams, QueryResult, ResultSetHeader, RowDataPacket } from 'mysql2/promise'; // Import for proper type for 'fields'

const app = express();
const port = 3000;

app.use(express.json());
// app.use(cors());
app.use(express.urlencoded({ extended: true }));

interface Admin extends RowDataPacket{
  id: number;
  adminname: string;
  adminpassword: string;
}

interface ExistingStudent extends RowDataPacket{
  Studentid: number;
  StudentName: string;
  StudentClass: string;
}

app.get('/api/emp/', (req: Request, res: Response) => {
  res.send('Hello World!');
});




const authenticateJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    
    jwt.verify(authHeader, 'hello', (err, decoded) => {
      if (err) {
        return res.sendStatus(403); 
      } else {
       if (typeof decoded === 'string') {
          req.headers.name = decoded; 
        } else if (decoded && typeof decoded === 'object') {
          req.headers.name = (decoded as JwtPayload).adminname as string; 
        }
        next();
      }
    });
  } else {
     res.sendStatus(401);
     return
  }
};




app.post('/api/fees/login', async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
       res.status(401).json({ msg: 'Invalid username or password' });
       return
    }

    // Execute SELECT query and expect 'result' to contain an array of rows
    const [result, fields]: [Admin[], FieldPacket[]] = await connection.execute(
      'SELECT * FROM admin WHERE adminname=? AND adminpassword=?',
      [name, password]
    );

    if (result.length === 0) {
       res.status(401).json({ msg: 'Invalid Username Or Password' });
       return
    }

      const adminname = result[0].adminname;
      const token = jwt.sign({ adminname}, 'hello');
      res.status(201).json({ msg: 'Login Successful', token });
      return

  } catch (err) {
    console.error(err);
     res.status(500).json({ msg: "Server Error" });
  }
});


app.get('/api/fees/getStudents',authenticateJwt, async (req: Request, res: Response) => {
  try {
  

    // Execute SELECT query and expect 'result' to contain an array of rows
    const [result, fields]: [Admin[], FieldPacket[]] = await connection.execute(
      'SELECT * FROM student WHERE StudentIsDelist="No"');


      res.status(201).json({ msg: result });
      return

  } catch (err) {
    console.error(err);
     res.status(500).json({ msg: "Server Error" });
  }
});

app.post('/api/fees/addStudent',authenticateJwt, async (req: Request, res: Response) => {
  try {
    const { StudentName, StudentClass,StudentSubject,StudentDoj,StudentFeesCycle,StudentFees,StudentIsDelist } = req.body;

    if (!StudentName || !StudentClass || !StudentSubject || !StudentDoj || !StudentFeesCycle || !StudentFees || !StudentIsDelist) {
       res.status(401).json({ msg: 'Invalid Data' });
       return
    }

    // Execute SELECT query and expect 'result' to contain an array of rows
    const [result, fields]: [ExistingStudent[], FieldPacket[]] = await connection.execute(
      'SELECT Studentid,StudentName,StudentClass FROM student WHERE StudentName=? AND StudentClass=?',
      [StudentName, StudentClass]
    );

    if (result.length !== 0) {
       res.status(401).json({ msg: 'Student Already Exists' });
       return
    }

    const id=StudentName+'-'+Date.now()

    const currentdate=new Date(StudentDoj)
    let currentMonth=currentdate.getMonth()
    let currentYear=currentdate.getFullYear()

    const [insertResult]: [ResultSetHeader, FieldPacket[]]=await connection.execute('INSERT INTO student (Studentid, StudentName, StudentClass, StudentSubject,StudentDoj,StudentFeesCycle,StudentFees,StudentIsDelist) VALUES (?,?,?,?,?,?,?,?)',[id,StudentName,StudentClass,StudentSubject,currentdate,StudentFeesCycle,StudentFees,StudentIsDelist])

   
    
    if (insertResult.affectedRows !== 1) {
       res.status(401).json({ msg: "Customer Is Not Added" });
       return
    }

    let studentFeesRecord=[]
    if(currentMonth<=3)
      {
          for (let month = 1; month <= 3; month++) 
          {

              studentFeesRecord.push([
                  `${id}-${Date.now()}-${month}`,
                  id,
                  0,
                  month,
                  currentYear,
                  null,
                  "No"
              ]);
          } 
      }
      else{
        for (let month = currentMonth; month <= 12; month++) {
          studentFeesRecord.push([
            `${id}-${Date.now()}-${month}`,
            id,
            0,
            month,
            currentYear,
            null,
            "No"
        ]);
      }
      for (let month = 1; month <= 3; month++) {
        studentFeesRecord.push([
          `${id}-${Date.now()}-${month}`,
          id,
          0,
          month,
          currentYear+1,
          null,
          "No"
      ]);
    }

    const bulkInsertQuery = `
    INSERT INTO studentfees(id, Studentid, FeesPaid, month, year, payDate, payStatus) VALUES ?`;

    const result2: [ResultSetHeader, FieldPacket[]] = await connection.query(bulkInsertQuery, [studentFeesRecord]);
    
    if (result2[0].affectedRows === 0) {
       res.status(401).json({ msg: "Customer Not Added" });
       return
    }

    res.status(201).json({ msg: "Customer Added Successfully" });

      }

  } catch (err) {
    console.error(err);
     res.status(500).json({ msg: "Server Error" });
  }
});

app.put('/api/fees/updateStudent/:stuid',authenticateJwt, async (req: Request, res: Response) => {
  try {
    const { StudentName, StudentClass,StudentSubject,StudentFeesCycle,StudentFees } = req.body;
    const { stuid } = req.params;

    if (!StudentName || !StudentClass || !StudentSubject  || !StudentFeesCycle || !StudentFees || !stuid) {
       res.status(401).json({ msg: 'Invalid Data' });
       return
    }

    // Execute SELECT query and expect 'result' to contain an array of rows
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.execute(
      'UPDATE student set StudentName=?,StudentClass=?,StudentSubject=?,StudentFeesCycle=?,StudentFees=? where Studentid=?',
      [StudentName, StudentClass,StudentSubject,StudentFeesCycle,StudentFees,stuid]
    );

    if (result.affectedRows === 0) {
       res.status(401).json({ msg: 'Student Not Updated' });
       return
    }


    res.status(201).json({ msg: "Student Updated Successfully" });

  } catch (err) {
    console.error(err);
     res.status(500).json({ msg: "Server Error" });
  }
});


app.put('/api/fees/updateStudentList/:stuid',authenticateJwt, async (req: Request, res: Response) => {
  try {
    const { stuid } = req.params;

    if (!stuid) {
       res.status(401).json({ msg: 'Invalid username or password' });
       return
    }

    // Execute SELECT query and expect 'result' to contain an array of rows
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.execute(
      'UPDATE student SET StudentIsDelist="Yes" WHERE Studentid=?',
      [stuid] 
    );

    if (result.affectedRows === 0) {
      res.status(401).json({ msg: "Cannot Able To Delist Student" });
      return
   }

   res.status(201).json({ msg: "Successfully Delisted Student" });
  } catch (err) {
    console.error(err);
     res.status(500).json({ msg: "Server Error" });
  }
});




app.put('/api/fees/enlistStudentList/:stuid',authenticateJwt, async (req: Request, res: Response) => {
  try {
    const { stuid } = req.params;

    if (!stuid) {
       res.status(401).json({ msg: 'Invalid username or password' });
       return
    }

    // Execute SELECT query and expect 'result' to contain an array of rows
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.execute(
      'UPDATE student SET StudentIsDelist="No" WHERE Studentid=?',
      [stuid] 
    );

    if (result.affectedRows === 0) {
      res.status(401).json({ msg: "Cannot Able To Enlist Student" });
      return
   }

   res.status(201).json({ msg: "Successfully Enlist Student" });
   return
  } catch (err) {
    console.error(err);
     res.status(500).json({ msg: "Server Error" });
  }
});


app.get('/api/fees/getDelistStudents',authenticateJwt, async (req: Request, res: Response) => {
  try {
  

    // Execute SELECT query and expect 'result' to contain an array of rows
    const [result, fields]: [Admin[], FieldPacket[]] = await connection.execute(
      'SELECT * FROM student WHERE StudentIsDelist="Yes"');


      res.status(201).json({ msg: result });
      return

  } catch (err) {
    console.error(err);
     res.status(500).json({ msg: "Server Error" });
  }
});


app.post('/api/fees/getStudentsFees',authenticateJwt, async (req: Request, res: Response) => {
  try {
  
    const {month}=req.body
    if(!month)
    {
      res.status(401).json({ msg: 'Invalid Data' });
      return
    }
  
    const currentYear = new Date().getFullYear();
    let year: number;
    if (month >= 1 && month <= 3) {
      year = currentYear + 1; 
    } else {
      year = currentYear; 
    }
    
    
    const [result, fields]: [Admin[], FieldPacket[]] = await connection.execute(
      `SELECT studentfees.*,student.StudentName,student.StudentClass,student.StudentFees 
      from studentfees
      LEFT JOIN student ON
      student.Studentid=studentfees.Studentid
      WHERE studentfees.month=? and year=?`,[parseInt(month),year]);


      res.status(201).json({ msg: result });
      return

  } catch (err) {
    console.error(err);
     res.status(500).json({ msg: "Server Error" });
  }
});


app.post('/api/fees/updateFees', authenticateJwt, async (req: Request, res: Response) => {
  try {
    const { studentArr, month } = req.body;

    
    if (!studentArr || studentArr.length === 0 || !month) {
      res.status(401).json({ msg: 'Invalid Data' });
      return;
    }

    const studentIds = studentArr.map((student: { id: string }) => student.id);

    const currentDate = new Date().toISOString().slice(0, 10); 

    const feesCaseStatement = studentArr.map((student: { id: string, StudentFees: number }) => 
      `WHEN id = '${student.id}' THEN ${student.StudentFees}`).join(' ');

    
    const placeholders = studentIds.map(() => '?').join(',');

    const [updateResult]: [ResultSetHeader, FieldPacket[]] = await connection.execute(
      `UPDATE studentfees
       SET paydate = ?, paystatus = 'Yes',
           FeesPaid = CASE ${feesCaseStatement} END
       WHERE id IN (${placeholders}) AND month = ?`,
      [currentDate, ...studentIds, month]
    );

    if (updateResult.affectedRows > 0) {
      res.status(200).json({ msg: 'Fees Updated Successfully' });
    } else {
      res.status(401).json({ msg: 'Fees Not Updated' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.delete('/api/fees/studentDelete/:stuid',authenticateJwt, async (req: Request, res: Response) => {
  try {
    const { stuid } = req.params;

    if (!stuid) {
       res.status(401).json({ msg: 'Invalid username or password' });
       return
    }

    // Execute SELECT query and expect 'result' to contain an array of rows
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.execute(
      `DELETE FROM studentfees WHERE Studentid =?`,[stuid]
    );

    const [result1]: [ResultSetHeader, FieldPacket[]] = await connection.execute(
      `DELETE FROM student WHERE Studentid =?`,[stuid]
    );
    

    if (result.affectedRows === 0 && result1.affectedRows===0) {
      res.status(401).json({ msg: "Student Not Deleted" });
      return
   }

   res.status(201).json({ msg: "Student Deleted Successfully" });
   return
  } catch (err) {
    console.error(err);
     res.status(500).json({ msg: "Server Error" });
  }
});


app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('*', (req, res) =>
res.sendFile(
  path.resolve(__dirname, '../../', 'client', 'dist', 'index.html')
)
);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
