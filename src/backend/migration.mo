import List "mo:core/List";
import Text "mo:core/Text";
import Float "mo:core/Float";

module {
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

  type Teacher = {
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

  type Student = {
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

  type StudentAttendance = {
    id : Text;
    studentId : Text;
    date : Text; // YYYY-MM-DD
    status : Text; // present/absent/late
    markedBy : Text; // teacherId
  };

  type TeacherAttendance = {
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

  type FeeStatus = Text; // paid/pending/partial

  type FeeRecord = {
    id : Text;
    studentId : Text;
    amount : Float;
    date : Text;
    status : FeeStatus;
    method : Text;
    description : Text;
    receiptNumber : Text;
  };

  type SubjectMarks = {
    subject : Text;
    marks : Float;
    maxMarks : Float;
  };

  type ExamResult = {
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

  type Notification = {
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

  type Homework = {
    id : Text;
    subject : Text;
    title : Text;
    description : Text;
    dueDate : Text;
    class_ : Text;
    teacherId : Text;
    postedAt : Text;
  };

  type CalendarEvent = {
    id : Text;
    title : Text;
    type_ : Text; // holiday/exam/event
    date : Text;
    description : Text;
    createdBy : Text;
  };

  type LeaveApplication = {
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

  type Timetable = {
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

  type Exam = {
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

  type ExamAttempt = {
    id : Text;
    examId : Text;
    studentId : Text;
    answersJson : Text;
    score : Float;
    submittedAt : Text;
    timeTaken : Nat;
  };

  type PortfolioEntry = {
    id : Text;
    studentId : Text;
    title : Text;
    description : Text;
    date : Text;
    type_ : Text;
    addedBy : Text;
  };

  type Suggestion = {
    id : Text;
    studentId : Text;
    studentName : Text;
    message : Text;
    submittedAt : Text;
    response : Text;
    respondedAt : Text;
  };

  type OldActor = {
    principalProfile : PrincipalProfile;
    teachers : List.List<Teacher>;
    students : List.List<Student>;
  };

  type NewActor = {
    principalProfile : PrincipalProfile;
    teachers : List.List<Teacher>;
    students : List.List<Student>;
    studentAttendance : List.List<StudentAttendance>;
    teacherAttendance : List.List<TeacherAttendance>;
    feeRecords : List.List<FeeRecord>;
    examResults : List.List<ExamResult>;
    notifications : List.List<Notification>;
    homework : List.List<Homework>;
    calendarEvents : List.List<CalendarEvent>;
    leaveApplications : List.List<LeaveApplication>;
    timetables : List.List<Timetable>;
    exams : List.List<Exam>;
    examAttempts : List.List<ExamAttempt>;
    portfolioEntries : List.List<PortfolioEntry>;
    suggestions : List.List<Suggestion>;
  };

  public func run(old : OldActor) : NewActor {
    { old with
      studentAttendance = List.empty<StudentAttendance>();
      teacherAttendance = List.empty<TeacherAttendance>();
      feeRecords = List.empty<FeeRecord>();
      examResults = List.empty<ExamResult>();
      notifications = List.empty<Notification>();
      homework = List.empty<Homework>();
      calendarEvents = List.empty<CalendarEvent>();
      leaveApplications = List.empty<LeaveApplication>();
      timetables = List.empty<Timetable>();
      exams = List.empty<Exam>();
      examAttempts = List.empty<ExamAttempt>();
      portfolioEntries = List.empty<PortfolioEntry>();
      suggestions = List.empty<Suggestion>();
    };
  };
};
