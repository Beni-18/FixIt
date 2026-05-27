class StaffAssignment < ApplicationRecord
  belongs_to :issue
  belongs_to :staff,       class_name: "User", foreign_key: :staff_id
  belongs_to :assigned_by, class_name: "User", foreign_key: :assigned_by_id

  validates :staff_id, uniqueness: { scope: :issue_id, message: "is already assigned to this issue" }

  validate :staff_must_be_staff_role

  scope :recent, -> { order(created_at: :desc) }

  private

  def staff_must_be_staff_role
    errors.add(:staff, "must have staff role") if staff && !staff.staff?
  end
end
