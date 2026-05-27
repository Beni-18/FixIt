class IssueStatusLog < ApplicationRecord
  belongs_to :issue
  belongs_to :changed_by, class_name: "User", foreign_key: :changed_by_id

  validates :from_status, inclusion: { in: Issue::STATUSES }
  validates :to_status,   inclusion: { in: Issue::STATUSES }

  scope :chronological, -> { order(created_at: :asc) }
end
