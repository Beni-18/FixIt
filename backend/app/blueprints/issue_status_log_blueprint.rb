class IssueStatusLogBlueprint < Blueprinter::Base
  identifier :id
  fields :from_status, :to_status, :note, :created_at
  association :changed_by, blueprint: UserBlueprint, view: :public
end
