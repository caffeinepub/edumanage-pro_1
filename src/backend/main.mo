import List "mo:core/List";
import Text "mo:core/Text";
import Float "mo:core/Float";

// EduManage Pro - Complete backend implementation
actor {
  ///////////////////// DATA MODELS //////////////////////

  type PrincipalProfile = {
    id : Text;
    password : Text;
    name : Text;
    email : Text;
    phone : Text;
    role : Text; // always "principal"
    photo : Text; // base64
    institutionLogo : Text; // base64
    institutionName : Text;
    institutionTagline : Text;
  };

  public type Teacher = {
    id : Text;
    password : Text;
    name : Text;
    subject : Text;
    email : Text;
    phone : Text;
    class_ : Text;
    role : Text; // always "teacher"
    photo : Text; // base64
  };

  public type Student = {
    id : Text;
    password : Text;
    name : Text;
    class_ : Text;
    rollNo : Text;
    parentName : Text;
    parentPhone : Text;
    teacherId : Text;
    role : Text; // always "student"
    photo : Text; // base64
  };

  public type StudentAttendance = {
    id : Text;
    studentId : Text;
    date : Text; // YYYY-MM-DD
    status : Text; // present/absent/late
    markedBy : Text; // teacherId
  };

  public type TeacherAttendance = {
    id : Text;
    teacherId : Text;
    date : Text;
    status : Text;
    checkInTime : Text;
    checkOutTime : Text;
    approvalStatus : Text; // pending/approved/rejected
    approvedBy : Text;
    approvalNote : Text;
  };

  public type FeeStatus = Text; // paid/pending/partial

  public type FeeRecord = {
    id : Text;
    studentId : Text;
    amount : Float;
    date : Text;
    status : FeeStatus;
    method : Text;
    description : Text;
    receiptNumber : Text;
  };

  public type SubjectMarks = {
    subject : Text;
    marks : Float;
    maxMarks : Float;
  };

  public type ExamResult = {
    id : Text;
    examName : Text;
    studentId : Text;
    teacherId : Text;
    class_ : Text;
    subjects : [SubjectMarks];
    submittedAt : Text;
    status : Text; // pending/approved/rejected
    approvedAt : Text;
  };

  public type Notification = {
    id : Text;
    title : Text;
    message : Text;
    date : Text;
    postedBy : Text;
    type_ : Text;
    targetClass : Text;
    attachment : Text; // base64
    attachmentName : Text;
  };

  public type Homework = {
    id : Text;
    subject : Text;
    title : Text;
    description : Text;
    dueDate : Text;
    class_ : Text;
    teacherId : Text;
    postedAt : Text;
  };

  public type CalendarEvent = {
    id : Text;
    title : Text;
    type_ : Text; // holiday/exam/event
    date : Text;
    description : Text;
    createdBy : Text;
  };

  public type LeaveApplication = {
    id : Text;
    applicantId : Text;
    applicantName : Text;
    applicantRole : Text;
    type_ : Text; // sick/casual/personal
    fromDate : Text;
    toDate : Text;
    reason : Text;
    status : Text; // pending/approved/rejected
    submittedAt : Text;
    reviewedBy : Text;
    reviewedAt : Text;
  };

  public type Timetable = {
    id : Text;
    class_ : Text;
    scheduleJson : Text;
    updatedAt : Text;
    updatedBy : Text;
    approvalStatus : Text;
    approvalNote : Text;
    approvedBy : Text;
    approvedAt : Text;
  };

  public type Exam = {
    id : Text;
    title : Text;
    subject : Text;
    duration : Nat;
    class_ : Text;
    teacherId : Text;
    createdAt : Text;
    questionsJson : Text;
    status : Text; // active/closed
  };

  public type ExamAttempt = {
    id : Text;
    examId : Text;
    studentId : Text;
    answersJson : Text;
    score : Float;
    submittedAt : Text;
    timeTaken : Nat;
  };

  public type PortfolioEntry = {
    id : Text;
    studentId : Text;
    title : Text;
    description : Text;
    date : Text;
    type_ : Text;
    addedBy : Text;
  };

  public type Suggestion = {
    id : Text;
    studentId : Text;
    studentName : Text;
    message : Text;
    submittedAt : Text;
    response : Text;
    respondedAt : Text;
  };

  public type HallTicketDesign = {
    institutionName : Text;
    tagline : Text;
    headerBg : Text;
    examName : Text;
    examYear : Text;
    subjectsJson : Text;
    showPrincipalSign : Bool;
    showClassTeacherSign : Bool;
    showLogo : Bool;
    borderStyle : Text;
  };

  ///////////////// INITIAL DATA ////////////////////

  var principalProfile : PrincipalProfile = {
    id = "principal001";
    password = "admin123";
    name = "Dr. Rajesh Kumar";
    email = "principal@school.com";
    phone = "9876543210";
    role = "principal";
    photo = "";
    institutionLogo = "";
    institutionName = "St. Xavier's High School";
    institutionTagline = "Excellence in Education";
  };

  public query ({ caller }) func getPrincipalProfile() : async PrincipalProfile {
    principalProfile;
  };

  public shared ({ caller }) func savePrincipalProfile(profile : PrincipalProfile) : async () {
    principalProfile := profile;
  };

  public query ({ caller }) func loginPrincipal(id : Text, password : Text) : async ?{
    id : Text;
    name : Text;
    role : Text;
  } {
    // Trim input password
    var trimmedPassword = password.trim(#char ' ');

    if (
      id == principalProfile.id and trimmedPassword == principalProfile.password
    ) {
      ?{
        id = principalProfile.id;
        name = principalProfile.name;
        role = "principal";
      };
    } else {
      null;
    };
  };

  public func initializeIfNeeded() : async () {
    if (students.isEmpty()) { initializeStudents() };
    if (teachers.isEmpty()) { initializeTeachers() };
  };

  public func initializeStudents() {
    students.add({
      id = "STU_001";
      password = "student123";
      name = "Aryan Sharma";
      class_ = "10A";
      rollNo = "1";
      parentName = "Ravi Sharma";
      parentPhone = "9876543210";
      teacherId = "TCH_001";
      role = "student";
      photo = "";
    });

    students.add({
      id = "STU_002";
      password = "student123";
      name = "Isha Verma";
      class_ = "10A";
      rollNo = "2";
      parentName = "Sunita Verma";
      parentPhone = "8765432109";
      teacherId = "TCH_001";
      role = "student";
      photo = "";
    });

    students.add({
      id = "STU_003";
      password = "student123";
      name = "Kabir Singh";
      class_ = "9B";
      rollNo = "1";
      parentName = "Rahul Singh";
      parentPhone = "7654321098";
      teacherId = "TCH_002";
      role = "student";
      photo = "";
    });

    students.add({
      id = "STU_004";
      password = "student123";
      name = "Meera Patel";
      class_ = "9B";
      rollNo = "2";
      parentName = "Pankaj Patel";
      parentPhone = "6543210987";
      teacherId = "TCH_002";
      role = "student";
      photo = "";
    });

    students.add({
      id = "STU_005";
      password = "student123";
      name = "Rohan Deshmukh";
      class_ = "8C";
      rollNo = "1";
      parentName = "Kiran Deshmukh";
      parentPhone = "5432109876";
      teacherId = "TCH_003";
      role = "student";
      photo = "";
    });
  };

  public func initializeTeachers() {
    teachers.add({
      id = "TCH_001";
      password = "teacher123";
      name = "Mrs. Priya Sharma";
      subject = "Mathematics";
      email = "priya.sharma@example.com";
      phone = "9876543210";
      class_ = "10A";
      role = "teacher";
      photo = "";
    });

    teachers.add({
      id = "TCH_002";
      password = "teacher123";
      name = "Mr. Amit Verma";
      subject = "Science";
      email = "amit.verma@example.com";
      phone = "8765432109";
      class_ = "9B";
      role = "teacher";
      photo = "";
    });

    teachers.add({
      id = "TCH_003";
      password = "teacher123";
      name = "Ms. Neha Gupta";
      subject = "English";
      email = "neha.gupta@example.com";
      phone = "7654321098";
      class_ = "8C";
      role = "teacher";
      photo = "";
    });
  };

  var teachers = List.empty<Teacher>();
  var students = List.empty<Student>();

  ///////////////// TEACHERS ////////////////////

  public query ({ caller }) func getTeachers() : async [Teacher] {
    teachers.toArray();
  };

  public query ({ caller }) func getTeacherById(id : Text) : async ?Teacher {
    teachers.find(func(t) { t.id == id });
  };

  public func addTeacher(teacher : Teacher) : async () {
    teachers.add(teacher);
  };

  public func updateTeacher(id : Text, updatedTeacher : Teacher) : async Bool {
    let previousSize = teachers.size();
    teachers := teachers.filter(func(t) { t.id != id });
    let newSize = teachers.size();

    if (newSize < previousSize) {
      teachers.add(updatedTeacher);
      true;
    } else { false };
  };

  public func deleteTeacher(id : Text) : async () {
    teachers := teachers.filter(func(t) { t.id != id });
  };

  ////////////////// STUDENTS /////////////////////

  public query ({ caller }) func getStudents() : async [Student] {
    students.toArray();
  };

  public query ({ caller }) func getStudentById(id : Text) : async ?Student {
    students.find(func(s) { s.id == id });
  };

  public query ({ caller }) func getStudentsByClass(class_ : Text) : async [Student] {
    students.filter(func(s) { s.class_ == class_ }).toArray();
  };

  public query ({ caller }) func getStudentsByTeacher(teacherId : Text) : async [Student] {
    students.filter(func(s) { s.teacherId == teacherId }).toArray();
  };

  public func addStudent(student : Student) : async () {
    students.add(student);
  };

  public func updateStudent(id : Text, updatedStudent : Student) : async Bool {
    let previousSize = students.size();
    students := students.filter(func(s) { s.id != id });
    let newSize = students.size();

    if (newSize < previousSize) {
      students.add(updatedStudent);
      true;
    } else { false };
  };

  public func deleteStudent(id : Text) : async () {
    students := students.filter(func(s) { s.id != id });
  };

  /////////////////////// AUTH /////////////////////////////

  public query ({ caller }) func loginTeacher(id : Text, password : Text) : async ?{
    id : Text;
    name : Text;
    role : Text;
    class_ : Text;
  } {
    let trimmedPassword = password.trim(#char ' ');
    teachers.find(
      func(t) {
        t.id == id and t.password.trim(#char ' ') == trimmedPassword
      }
    );
  };

  public query ({ caller }) func loginStudent(id : Text, password : Text) : async ?{
    id : Text;
    name : Text;
    role : Text;
    class_ : Text;
  } {
    let trimmedPassword = password.trim(#char ' ');
    students.find(
      func(s) {
        s.id == id and s.password.trim(#char ' ') == trimmedPassword
      }
    );
  };
};
