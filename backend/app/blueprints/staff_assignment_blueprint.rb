class StaffAssignmentBlueprint < Blueprinter::Base
  identifier :id
  fields :note, :created_at
  association :staff,       blueprint: UserBlueprint, view: :public
  association :assigned_by, blueprint: UserBlueprint, view: :public
end
