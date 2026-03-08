import List "mo:core/List";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Order "mo:core/Order";



actor {
  ///////////////////// DATA MODELS //////////////////////

  public type PrincipalProfile = {
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

  public type GameScore = {
    id : Text;
    studentId : Text;
    studentName : Text;
    class_ : Text;
    gameId : Text;
    stars : Nat;
    score : Nat;
    total : Nat;
    playedAt : Text;
  };

  ///////////////// INITIAL DATA ////////////////////

  public type AuthResult = {
    id : Text;
    name : Text;
    role : Text;
  };

  public type AuthWithClassResult = {
    id : Text;
    name : Text;
    role : Text;
    class_ : Text;
  };

  // Persistent State initialization (Store all data in the canister)
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

  var hallTicketDesign : ?HallTicketDesign = null;
  var teachers = List.empty<Teacher>();
  var students = List.empty<Student>();
  var studentAttendance = List.empty<StudentAttendance>();
  var teacherAttendance = List.empty<TeacherAttendance>();
  var feeRecords = List.empty<FeeRecord>();
  var examResults = List.empty<ExamResult>();
  var notifications = List.empty<Notification>();
  var homework = List.empty<Homework>();
  var calendarEvents = List.empty<CalendarEvent>();
  var leaveApplications = List.empty<LeaveApplication>();
  var timetables = List.empty<Timetable>();
  var exams = List.empty<Exam>();
  var examAttempts = List.empty<ExamAttempt>();
  var portfolioEntries = List.empty<PortfolioEntry>();
  var suggestions = List.empty<Suggestion>();
  var gameScores = List.empty<GameScore>();

  // Principal and Hall Ticket (single record)
  public query ({ caller }) func getPrincipalProfile() : async PrincipalProfile {
    principalProfile;
  };

  public func savePrincipalProfile(profile : PrincipalProfile) : async () {
    principalProfile := profile;
  };

  public query ({ caller }) func getHallTicketDesign() : async ?HallTicketDesign {
    hallTicketDesign;
  };

  public shared ({ caller }) func saveHallTicketDesign(newDesign : HallTicketDesign) : async () {
    hallTicketDesign := ?newDesign;
  };

  /////////////////// AUTH /////////////////////////

  public query ({ caller }) func loginPrincipal(id : Text, password : Text) : async ?AuthResult {
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

  public query ({ caller }) func loginTeacher(id : Text, password : Text) : async ?AuthWithClassResult {
    let trimmedPassword = password.trim(#char ' ');
    let teacher = teachers.find(
      func(t) {
        t.id == id and t.password.trim(#char ' ') == trimmedPassword
      }
    );
    switch (teacher) {
      case (null) { null };
      case (?t) {
        ?{
          id = t.id;
          name = t.name;
          role = t.role;
          class_ = t.class_;
        };
      };
    };
  };

  public query ({ caller }) func loginStudent(id : Text, password : Text) : async ?AuthWithClassResult {
    let trimmedPassword = password.trim(#char ' ');
    let student = students.find(
      func(s) {
        s.id == id and s.password.trim(#char ' ') == trimmedPassword
      }
    );
    switch (student) {
      case (null) { null };
      case (?s) {
        ?{
          id = s.id;
          name = s.name;
          role = s.role;
          class_ = s.class_;
        };
      };
    };
  };

  /////////////// INITIAL DATA SEEDING /////////////////

  public func initializeIfNeeded() : async () {
    if (
      students.isEmpty() and
      teachers.isEmpty() and
      studentAttendance.isEmpty() and
      teacherAttendance.isEmpty() and
      feeRecords.isEmpty() and
      examResults.isEmpty() and
      notifications.isEmpty() and
      homework.isEmpty() and
      calendarEvents.isEmpty() and
      leaveApplications.isEmpty() and
      timetables.isEmpty() and
      exams.isEmpty() and
      examAttempts.isEmpty() and
      portfolioEntries.isEmpty() and
      suggestions.isEmpty()
    ) {
      initializeStudents();
      initializeTeachers();
    };
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

  ///////////////// GENERIC LIST OPERATIONS ////////////////////

  // TEACHERS
  public query ({ caller }) func getAllTeachers() : async [Teacher] {
    teachers.toArray();
  };

  public func addTeacher(teacher : Teacher) : async () {
    teachers.add(teacher);
  };

  public func updateTeacher(id : Text, teacher : Teacher) : async Bool {
    let index = teachers.findIndex(func(t) { t.id == id });
    switch (index) {
      case (?i) {
        let filtered = teachers.filter(func(t) { t.id != id });
        teachers := filtered;
        teachers.add(teacher);
        true;
      };
      case (null) { false };
    };
  };

  public func deleteTeacher(id : Text) : async () {
    teachers := teachers.filter(func(t) { t.id != id });
  };

  // STUDENTS
  public query ({ caller }) func getAllStudents() : async [Student] {
    students.toArray();
  };

  public func addStudent(student : Student) : async () {
    students.add(student);
  };

  public func updateStudent(id : Text, student : Student) : async Bool {
    let index = students.findIndex(func(s) { s.id == id });
    switch (index) {
      case (?i) {
        let filtered = students.filter(func(s) { s.id != id });
        students := filtered;
        students.add(student);
        true;
      };
      case (null) { false };
    };
  };

  public func deleteStudent(id : Text) : async () {
    students := students.filter(func(s) { s.id != id });
  };

  // STUDENT ATTENDANCE
  public query ({ caller }) func getAllStudentAttendance() : async [StudentAttendance] {
    studentAttendance.toArray();
  };

  public func addStudentAttendance(attendance : StudentAttendance) : async () {
    studentAttendance.add(attendance);
  };

  public func updateStudentAttendance(id : Text, attendance : StudentAttendance) : async Bool {
    let filtered = studentAttendance.filter(func(a) { a.id != id });
    let originalSize = studentAttendance.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      studentAttendance := filtered;
      studentAttendance.add(attendance);
      true;
    } else {
      false;
    };
  };

  public func deleteStudentAttendance(id : Text) : async () {
    studentAttendance := studentAttendance.filter(func(a) { a.id != id });
  };

  // TEACHER ATTENDANCE
  public query ({ caller }) func getAllTeacherAttendance() : async [TeacherAttendance] {
    teacherAttendance.toArray();
  };

  public func addTeacherAttendance(attendance : TeacherAttendance) : async () {
    teacherAttendance.add(attendance);
  };

  public func updateTeacherAttendance(id : Text, attendance : TeacherAttendance) : async Bool {
    let filtered = teacherAttendance.filter(func(a) { a.id != id });
    let originalSize = teacherAttendance.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      teacherAttendance := filtered;
      teacherAttendance.add(attendance);
      true;
    } else {
      false;
    };
  };

  public func deleteTeacherAttendance(id : Text) : async () {
    teacherAttendance := teacherAttendance.filter(func(a) { a.id != id });
  };

  // FEE RECORDS
  public query ({ caller }) func getAllFeeRecords() : async [FeeRecord] {
    feeRecords.toArray();
  };

  public func addFeeRecord(record : FeeRecord) : async () {
    feeRecords.add(record);
  };

  public func updateFeeRecord(id : Text, record : FeeRecord) : async Bool {
    let filtered = feeRecords.filter(func(r) { r.id != id });
    let originalSize = feeRecords.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      feeRecords := filtered;
      feeRecords.add(record);
      true;
    } else {
      false;
    };
  };

  public func deleteFeeRecord(id : Text) : async () {
    feeRecords := feeRecords.filter(func(r) { r.id != id });
  };

  // EXAM RESULTS
  public query ({ caller }) func getAllExamResults() : async [ExamResult] {
    examResults.toArray();
  };

  public func addExamResult(result : ExamResult) : async () {
    examResults.add(result);
  };

  public func updateExamResult(id : Text, result : ExamResult) : async Bool {
    let filtered = examResults.filter(func(r) { r.id != id });
    let originalSize = examResults.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      examResults := filtered;
      examResults.add(result);
      true;
    } else {
      false;
    };
  };

  public func deleteExamResult(id : Text) : async () {
    examResults := examResults.filter(func(r) { r.id != id });
  };

  // NOTIFICATIONS
  public query ({ caller }) func getAllNotifications() : async [Notification] {
    notifications.toArray();
  };

  public func addNotification(notification : Notification) : async () {
    notifications.add(notification);
  };

  public func updateNotification(id : Text, notification : Notification) : async Bool {
    let filtered = notifications.filter(func(n) { n.id != id });
    let originalSize = notifications.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      notifications := filtered;
      notifications.add(notification);
      true;
    } else {
      false;
    };
  };

  public func deleteNotification(id : Text) : async () {
    notifications := notifications.filter(func(n) { n.id != id });
  };

  // HOMEWORK
  public query ({ caller }) func getAllHomework() : async [Homework] {
    homework.toArray();
  };

  public func addHomework(assignment : Homework) : async () {
    homework.add(assignment);
  };

  public func updateHomework(id : Text, assignment : Homework) : async Bool {
    let filtered = homework.filter(func(a) { a.id != id });
    let originalSize = homework.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      homework := filtered;
      homework.add(assignment);
      true;
    } else {
      false;
    };
  };

  public func deleteHomework(id : Text) : async () {
    homework := homework.filter(func(a) { a.id != id });
  };

  // CALENDAR EVENTS
  public query ({ caller }) func getAllCalendarEvents() : async [CalendarEvent] {
    calendarEvents.toArray();
  };

  public func addCalendarEvent(event : CalendarEvent) : async () {
    calendarEvents.add(event);
  };

  public func updateCalendarEvent(id : Text, event : CalendarEvent) : async Bool {
    let filtered = calendarEvents.filter(func(e) { e.id != id });
    let originalSize = calendarEvents.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      calendarEvents := filtered;
      calendarEvents.add(event);
      true;
    } else {
      false;
    };
  };

  public func deleteCalendarEvent(id : Text) : async () {
    calendarEvents := calendarEvents.filter(func(e) { e.id != id });
  };

  // LEAVE APPLICATIONS
  public query ({ caller }) func getAllLeaveApplications() : async [LeaveApplication] {
    leaveApplications.toArray();
  };

  public func addLeaveApplication(application : LeaveApplication) : async () {
    leaveApplications.add(application);
  };

  public func updateLeaveApplication(id : Text, application : LeaveApplication) : async Bool {
    let filtered = leaveApplications.filter(func(a) { a.id != id });
    let originalSize = leaveApplications.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      leaveApplications := filtered;
      leaveApplications.add(application);
      true;
    } else {
      false;
    };
  };

  public func deleteLeaveApplication(id : Text) : async () {
    leaveApplications := leaveApplications.filter(func(a) { a.id != id });
  };

  // TIMETABLES
  public query ({ caller }) func getAllTimetables() : async [Timetable] {
    timetables.toArray();
  };

  public func addTimetable(timetable : Timetable) : async () {
    timetables.add(timetable);
  };

  public func updateTimetable(id : Text, timetable : Timetable) : async Bool {
    let filtered = timetables.filter(func(t) { t.id != id });
    let originalSize = timetables.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      timetables := filtered;
      timetables.add(timetable);
      true;
    } else {
      false;
    };
  };

  public func deleteTimetable(id : Text) : async () {
    timetables := timetables.filter(func(t) { t.id != id });
  };

  // EXAMS
  public query ({ caller }) func getAllExams() : async [Exam] {
    exams.toArray();
  };

  public func addExam(exam : Exam) : async () {
    exams.add(exam);
  };

  public func updateExam(id : Text, exam : Exam) : async Bool {
    let filtered = exams.filter(func(e) { e.id != id });
    let originalSize = exams.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      exams := filtered;
      exams.add(exam);
      true;
    } else {
      false;
    };
  };

  public func deleteExam(id : Text) : async () {
    exams := exams.filter(func(e) { e.id != id });
  };

  // EXAM ATTEMPTS
  public query ({ caller }) func getAllExamAttempts() : async [ExamAttempt] {
    examAttempts.toArray();
  };

  public func addExamAttempt(attempt : ExamAttempt) : async () {
    examAttempts.add(attempt);
  };

  public func updateExamAttempt(id : Text, attempt : ExamAttempt) : async Bool {
    let filtered = examAttempts.filter(func(a) { a.id != id });
    let originalSize = examAttempts.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      examAttempts := filtered;
      examAttempts.add(attempt);
      true;
    } else {
      false;
    };
  };

  public func deleteExamAttempt(id : Text) : async () {
    examAttempts := examAttempts.filter(func(a) { a.id != id });
  };

  // PORTFOLIO ENTRIES
  public query ({ caller }) func getAllPortfolioEntries() : async [PortfolioEntry] {
    portfolioEntries.toArray();
  };

  public func addPortfolioEntry(entry : PortfolioEntry) : async () {
    portfolioEntries.add(entry);
  };

  public func updatePortfolioEntry(id : Text, entry : PortfolioEntry) : async Bool {
    let filtered = portfolioEntries.filter(func(e) { e.id != id });
    let originalSize = portfolioEntries.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      portfolioEntries := filtered;
      portfolioEntries.add(entry);
      true;
    } else {
      false;
    };
  };

  public func deletePortfolioEntry(id : Text) : async () {
    portfolioEntries := portfolioEntries.filter(func(e) { e.id != id });
  };

  // SUGGESTIONS
  public query ({ caller }) func getAllSuggestions() : async [Suggestion] {
    suggestions.toArray();
  };

  public func addSuggestion(suggestion : Suggestion) : async () {
    suggestions.add(suggestion);
  };

  public func updateSuggestion(id : Text, suggestion : Suggestion) : async Bool {
    let filtered = suggestions.filter(func(s) { s.id != id });
    let originalSize = suggestions.size();
    let newSize = filtered.size();

    if (newSize < originalSize) {
      suggestions := filtered;
      suggestions.add(suggestion);
      true;
    } else {
      false;
    };
  };

  public func deleteSuggestion(id : Text) : async () {
    suggestions := suggestions.filter(func(s) { s.id != id });
  };

  ///////////////////// GAME SCORES ///////////////////////

  public func saveGameScore(gameScore : GameScore) : async () {
    // If entry exists for student+game, only update if new score is better.
    gameScores := gameScores.filter(
      func(s) {
        if (s.studentId == gameScore.studentId and s.gameId == gameScore.gameId) {
          return isBetterScore(gameScore, s);
        } else {
          true;
        };
      }
    );
    gameScores.add(gameScore);
  };

  public query ({ caller }) func getGameScoresForStudent(studentId : Text) : async [GameScore] {
    gameScores.filter(func(s) { s.studentId == studentId }).toArray();
  };

  public query ({ caller }) func getMyGameScores(studentId : Text) : async [GameScore] {
    gameScores.filter(func(s) { s.studentId == studentId }).toArray();
  };

  public query ({ caller }) func getGameLeaderboard(gameId : Text, class_ : Text) : async [GameScore] {
    let filtered = gameScores.filter(
      func(s) { s.gameId == gameId and s.class_ == class_ }
    );

    let sorted = filtered.toArray().sort(
      compareScores
    );

    sorted.sliceToArray(0, Nat.min(sorted.size(), 10));
  };

  //////////// HELPER FUNCTIONS ///////////////

  func isBetterScore(newScore : GameScore, oldScore : GameScore) : Bool {
    if (newScore.stars > oldScore.stars) { return true };
    if (newScore.stars < oldScore.stars) { return false };

    if (newScore.score > oldScore.score) { return true };
    if (newScore.score < oldScore.score) { return false };

    newScore.total > oldScore.total;
  };

  func compareScores(a : GameScore, b : GameScore) : Order.Order {
    switch (Nat.compare(b.stars, a.stars)) {
      case (#less) { #greater };
      case (#greater) { #less };
      case (#equal) {
        switch (Nat.compare(b.score, a.score)) {
          case (#less) { #greater };
          case (#greater) { #less };
          case (#equal) {
            Nat.compare(b.total, a.total);
          };
        };
      };
    };
  };
};
