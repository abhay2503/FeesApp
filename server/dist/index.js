"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import cors from 'cors';
const connection_1 = __importDefault(require("./connection"));
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
// app.use(cors());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/api/emp/', (req, res) => {
    res.send('Hello World!');
});
const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        jsonwebtoken_1.default.verify(authHeader, 'hello', (err, decoded) => {
            if (err) {
                return res.sendStatus(403);
            }
            else {
                if (typeof decoded === 'string') {
                    req.headers.name = decoded;
                }
                else if (decoded && typeof decoded === 'object') {
                    req.headers.name = decoded.adminname;
                }
                next();
            }
        });
    }
    else {
        res.sendStatus(401);
        return;
    }
};
app.post('/api/fees/login', async (req, res) => {
    try {
        const { name, password } = req.body;
        if (!name || !password) {
            res.status(401).json({ msg: 'Invalid username or password' });
            return;
        }
        // Execute SELECT query and expect 'result' to contain an array of rows
        const [result, fields] = await connection_1.default.execute('SELECT * FROM admin WHERE adminname=? AND adminpassword=?', [name, password]);
        if (result.length === 0) {
            res.status(401).json({ msg: 'Invalid Username Or Password' });
            return;
        }
        const adminname = result[0].adminname;
        const token = jsonwebtoken_1.default.sign({ adminname }, 'hello');
        res.status(201).json({ msg: 'Login Successful', token });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});
app.get('/api/fees/getStudents', authenticateJwt, async (req, res) => {
    try {
        // Execute SELECT query and expect 'result' to contain an array of rows
        const [result, fields] = await connection_1.default.execute('SELECT * FROM student WHERE StudentIsDelist="No"');
        res.status(201).json({ msg: result });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});
app.post('/api/fees/addStudent', authenticateJwt, async (req, res) => {
    try {
        const { StudentName, StudentClass, StudentSubject, StudentDoj, StudentFeesCycle, StudentFees, StudentIsDelist } = req.body;
        if (!StudentName || !StudentClass || !StudentSubject || !StudentDoj || !StudentFeesCycle || !StudentFees || !StudentIsDelist) {
            res.status(401).json({ msg: 'Invalid Data' });
            return;
        }
        // Execute SELECT query and expect 'result' to contain an array of rows
        const [result, fields] = await connection_1.default.execute('SELECT Studentid,StudentName,StudentClass FROM student WHERE StudentName=? AND StudentClass=?', [StudentName, StudentClass]);
        if (result.length !== 0) {
            res.status(401).json({ msg: 'Student Already Exists' });
            return;
        }
        const id = StudentName + '-' + Date.now();
        const currentdate = new Date(StudentDoj);
        let currentMonth = currentdate.getMonth();
        let currentYear = currentdate.getFullYear();
        const [insertResult] = await connection_1.default.execute('INSERT INTO student (Studentid, StudentName, StudentClass, StudentSubject,StudentDoj,StudentFeesCycle,StudentFees,StudentIsDelist) VALUES (?,?,?,?,?,?,?,?)', [id, StudentName, StudentClass, StudentSubject, currentdate, StudentFeesCycle, StudentFees, StudentIsDelist]);
        if (insertResult.affectedRows !== 1) {
            res.status(401).json({ msg: "Customer Is Not Added" });
            return;
        }
        let studentFeesRecord = [];
        if (currentMonth <= 3) {
            for (let month = 1; month <= 3; month++) {
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
        else {
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
                    currentYear + 1,
                    null,
                    "No"
                ]);
            }
            const bulkInsertQuery = `
    INSERT INTO studentfees(id, Studentid, FeesPaid, month, year, payDate, payStatus) VALUES ?`;
            const result2 = await connection_1.default.query(bulkInsertQuery, [studentFeesRecord]);
            if (result2[0].affectedRows === 0) {
                res.status(401).json({ msg: "Customer Not Added" });
                return;
            }
            res.status(201).json({ msg: "Customer Added Successfully" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});
app.put('/api/fees/updateStudent/:stuid', authenticateJwt, async (req, res) => {
    try {
        const { StudentName, StudentClass, StudentSubject, StudentFeesCycle, StudentFees } = req.body;
        const { stuid } = req.params;
        if (!StudentName || !StudentClass || !StudentSubject || !StudentFeesCycle || !StudentFees || !stuid) {
            res.status(401).json({ msg: 'Invalid Data' });
            return;
        }
        // Execute SELECT query and expect 'result' to contain an array of rows
        const [result] = await connection_1.default.execute('UPDATE student set StudentName=?,StudentClass=?,StudentSubject=?,StudentFeesCycle=?,StudentFees=? where Studentid=?', [StudentName, StudentClass, StudentSubject, StudentFeesCycle, StudentFees, stuid]);
        if (result.affectedRows === 0) {
            res.status(401).json({ msg: 'Student Not Updated' });
            return;
        }
        res.status(201).json({ msg: "Student Updated Successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});
app.put('/api/fees/updateStudentList/:stuid', authenticateJwt, async (req, res) => {
    try {
        const { stuid } = req.params;
        if (!stuid) {
            res.status(401).json({ msg: 'Invalid username or password' });
            return;
        }
        // Execute SELECT query and expect 'result' to contain an array of rows
        const [result] = await connection_1.default.execute('UPDATE student SET StudentIsDelist="Yes" WHERE Studentid=?', [stuid]);
        if (result.affectedRows === 0) {
            res.status(401).json({ msg: "Cannot Able To Delist Student" });
            return;
        }
        res.status(201).json({ msg: "Successfully Delisted Student" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});
app.put('/api/fees/enlistStudentList/:stuid', authenticateJwt, async (req, res) => {
    try {
        const { stuid } = req.params;
        if (!stuid) {
            res.status(401).json({ msg: 'Invalid username or password' });
            return;
        }
        // Execute SELECT query and expect 'result' to contain an array of rows
        const [result] = await connection_1.default.execute('UPDATE student SET StudentIsDelist="No" WHERE Studentid=?', [stuid]);
        if (result.affectedRows === 0) {
            res.status(401).json({ msg: "Cannot Able To Enlist Student" });
            return;
        }
        res.status(201).json({ msg: "Successfully Enlist Student" });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});
app.get('/api/fees/getDelistStudents', authenticateJwt, async (req, res) => {
    try {
        // Execute SELECT query and expect 'result' to contain an array of rows
        const [result, fields] = await connection_1.default.execute('SELECT * FROM student WHERE StudentIsDelist="Yes"');
        res.status(201).json({ msg: result });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});
app.post('/api/fees/getStudentsFees', authenticateJwt, async (req, res) => {
    try {
        const { month } = req.body;
        if (!month) {
            res.status(401).json({ msg: 'Invalid Data' });
            return;
        }
        const currentYear = new Date().getFullYear();
        let year;
        if (month >= 1 && month <= 3) {
            year = currentYear + 1;
        }
        else {
            year = currentYear;
        }
        const [result, fields] = await connection_1.default.execute(`SELECT studentfees.*,student.StudentName,student.StudentClass,student.StudentFees 
      from studentfees
      LEFT JOIN student ON
      student.Studentid=studentfees.Studentid
      WHERE studentfees.month=? and year=?`, [parseInt(month), year]);
        res.status(201).json({ msg: result });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});
app.post('/api/fees/updateFees', authenticateJwt, async (req, res) => {
    try {
        const { studentArr, month } = req.body;
        if (!studentArr || studentArr.length === 0 || !month) {
            res.status(401).json({ msg: 'Invalid Data' });
            return;
        }
        const studentIds = studentArr.map((student) => student.id);
        const currentDate = new Date().toISOString().slice(0, 10);
        const feesCaseStatement = studentArr.map((student) => `WHEN id = '${student.id}' THEN ${student.StudentFees}`).join(' ');
        const placeholders = studentIds.map(() => '?').join(',');
        const [updateResult] = await connection_1.default.execute(`UPDATE studentfees
       SET paydate = ?, paystatus = 'Yes',
           FeesPaid = CASE ${feesCaseStatement} END
       WHERE id IN (${placeholders}) AND month = ?`, [currentDate, ...studentIds, month]);
        if (updateResult.affectedRows > 0) {
            res.status(200).json({ msg: 'Fees Updated Successfully' });
        }
        else {
            res.status(401).json({ msg: 'Fees Not Updated' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});
app.delete('/api/fees/studentDelete/:stuid', authenticateJwt, async (req, res) => {
    try {
        const { stuid } = req.params;
        if (!stuid) {
            res.status(401).json({ msg: 'Invalid username or password' });
            return;
        }
        // Execute SELECT query and expect 'result' to contain an array of rows
        const [result] = await connection_1.default.execute(`DELETE FROM studentfees WHERE Studentid =?`, [stuid]);
        const [result1] = await connection_1.default.execute(`DELETE FROM student WHERE Studentid =?`, [stuid]);
        if (result.affectedRows === 0 && result1.affectedRows === 0) {
            res.status(401).json({ msg: "Student Not Deleted" });
            return;
        }
        res.status(201).json({ msg: "Student Deleted Successfully" });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});
app.use(express_1.default.static(path_1.default.join(__dirname, '../../client/dist')));
app.get('*', (req, res) => res.sendFile(path_1.default.resolve(__dirname, '../../', 'client', 'dist', 'index.html')));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
