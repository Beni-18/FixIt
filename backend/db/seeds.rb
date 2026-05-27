puts "Seeding Rathinam Technical Campus FixIT..."

admin = User.find_or_create_by!(email: "admin@rathinam.in") do |u|
  u.name     = "Campus Admin"
  u.password = "Admin@123"
  u.role     = "admin"
  u.verified = true
end
puts "Admin: #{admin.email}"

staff_data = [
  { name: "Ravi Kumar",  email: "ravi@rathinam.in",   department: "Electrical" },
  { name: "Suresh Babu", email: "suresh@rathinam.in",  department: "Civil & Maintenance" },
  { name: "Priya Nair",  email: "priya@rathinam.in",   department: "IT Infrastructure" },
]

staff_users = staff_data.map do |s|
  u = User.find_or_create_by!(email: s[:email]) do |user|
    user.name       = s[:name]
    user.password   = "Staff@123"
    user.role       = "staff"
    user.department = s[:department]
    user.verified   = true
  end
  puts "Staff: #{u.email}"
  u
end

student_data = [
  { name: "Arjun Selvam",   email: "arjun@rathinam.in",   student_id: "RTC2021CS001", dept: "CSE" },
  { name: "Meena Lakshmi",  email: "meena@rathinam.in",   student_id: "RTC2021EE012", dept: "EEE" },
  { name: "Vikram Anand",   email: "vikram@rathinam.in",  student_id: "RTC2022ME034", dept: "MECH" },
  { name: "Divya Krishnan", email: "divya@rathinam.in",   student_id: "RTC2022IT056", dept: "IT" },
  { name: "Karthik Raj",    email: "karthik@rathinam.in", student_id: "RTC2023CSE78", dept: "CSE" },
]

students = student_data.map do |s|
  # Find by new email, or by student_id (handles old-domain seeds migration)
  u = User.find_by(email: s[:email]) || User.find_by(student_id: s[:student_id])
  if u
    u.update!(email: s[:email], name: s[:name], department: s[:dept])
  else
    u = User.create!(
      name:       s[:name],
      email:      s[:email],
      password:   "Student@123",
      role:       "student",
      student_id: s[:student_id],
      department: s[:dept],
      verified:   [true, false].sample
    )
  end
  puts "Student: #{u.email}"
  u
end

issues_data = [
  { title: "Projector not working in Room 301",
    description: "The projector in Room 301, Block A has been non-functional for 3 days. Classes are being disrupted as faculty cannot display lecture slides.",
    location: "Block A", category: "Classroom Equipment", status: "raised" },
  { title: "Power socket blown in Computer Lab 2",
    description: "Two power sockets near the workstations in Computer Lab 2 are non-functional. Students cannot charge laptops during practicals.",
    location: "Computer Lab 2", category: "Electrical", status: "processed" },
  { title: "Ceiling fans not working in Room 204",
    description: "All 4 ceiling fans in Room 204, Block C stopped working since Monday. The room is unbearably hot and affecting concentration.",
    location: "Block C", category: "Electrical", status: "being_resolved" },
  { title: "Smart board markers missing in Seminar Hall",
    description: "The digital smart board in the seminar hall has been without working markers for over a week. Cannot be used for presentations.",
    location: "Seminar Hall", category: "Classroom Equipment", status: "raised" },
  { title: "Street light near hostel is out",
    description: "The street light between the main building and hostel block has been off for 5 days. Unsafe for students walking at night.",
    location: "Main Road", category: "Electrical", status: "resolved" },
  { title: "Broken desk chairs in Room 105",
    description: "At least 8 chair-desks in Room 105 have broken frames or loose bolts. This poses a risk of injury to students.",
    location: "Block A", category: "Furniture", status: "raised" },
  { title: "Wi-Fi not working in Library second floor",
    description: "The Wi-Fi access point on Library 2nd floor has been dead for 2 days. Students cannot access online resources.",
    location: "Library", category: "Wi-Fi / Network", status: "raised" },
  { title: "Broken tap in men's washroom, Block B",
    description: "The tap in the men's washroom on the ground floor of Block B is leaking continuously. Water is being wasted.",
    location: "Block B", category: "Plumbing", status: "processed" },
]

issues = issues_data.each_with_index.map do |data, idx|
  student = students[idx % students.length]
  issue   = Issue.find_or_create_by!(title: data[:title], user: student) do |i|
    i.description = data[:description]
    i.location    = data[:location]
    i.category    = data[:category]
    i.status      = data[:status]
  end
  puts "Issue: #{issue.title[0..50]}"
  issue
end

# Upvotes
issues.each do |issue|
  voters = students.reject { |s| s.id == issue.user_id }.sample(rand(2..4))
  voters.each do |voter|
    Upvote.find_or_create_by!(user_id: voter.id, issue_id: issue.id)
  rescue ActiveRecord::RecordNotUnique
    next
  end
end

# Reset upvotes_count counter cache (bypasses service layer)
issues.each do |issue|
  issue.update_column(:upvotes_count, issue.upvotes.count)
end
puts "Upvote counts refreshed"

# Status logs
processed_issue = issues.find { |i| i.status == "processed" }
if processed_issue
  IssueStatusLog.find_or_create_by!(issue: processed_issue, from_status: "raised", to_status: "processed") do |log|
    log.changed_by = admin
    log.note       = "Reviewed and forwarded to electrical maintenance."
  end
end

being_resolved_issue = issues.find { |i| i.status == "being_resolved" }
if being_resolved_issue
  IssueStatusLog.find_or_create_by!(issue: being_resolved_issue, from_status: "raised", to_status: "processed") do |log|
    log.changed_by = admin
    log.note       = "Issue acknowledged."
  end
  IssueStatusLog.find_or_create_by!(issue: being_resolved_issue, from_status: "processed", to_status: "being_resolved") do |log|
    log.changed_by = admin
    log.note       = "Maintenance team assigned. Work in progress."
  end
end

resolved_issue = issues.find { |i| i.status == "resolved" }
if resolved_issue
  [["raised","processed"], ["processed","being_resolved"], ["being_resolved","resolved"]].each do |from, to|
    IssueStatusLog.find_or_create_by!(issue: resolved_issue, from_status: from, to_status: to) do |log|
      log.changed_by = admin
      log.note       = to == "resolved" ? "Street light repaired and tested. Issue closed." : nil
    end
  end
end

# Comments
issues.first(4).each do |issue|
  students.sample(2).each_with_index do |student, i|
    Comment.find_or_create_by!(issue: issue, user: student) do |c|
      c.content = [
        "This is affecting our sessions badly. Please fix ASAP.",
        "I faced this too this morning. Needs urgent attention.",
        "Can admin please expedite this? Exams are approaching.",
        "The situation has worsened. Please escalate.",
      ][i % 4]
    end
  end
end

puts "\nSeeding complete!"
puts "─────────────────────────────────────────"
puts "Admin login:   admin@rathinam.in  / Admin@123"
puts "Student login: arjun@rathinam.in  / Student@123"
puts "Staff login:   ravi@rathinam.in   / Staff@123"
puts "─────────────────────────────────────────"
