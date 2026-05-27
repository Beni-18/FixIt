class Issue < ApplicationRecord
  STATUSES   = %w[raised processed being_resolved resolved].freeze
  CATEGORIES = ["Classroom Equipment", "Electrical", "Wi-Fi / Network",
                 "Plumbing", "Sanitation", "Security", "Furniture", "Other"].freeze

  STATUS_COLORS = {
    "raised"          => "yellow",
    "processed"       => "orange",
    "being_resolved"  => "sky",
    "resolved"        => "emerald"
  }.freeze

  STATUS_ORDER = STATUSES.each_with_index.to_h.freeze

  belongs_to :user
  has_many   :comments,         dependent: :destroy
  has_many   :upvotes,          dependent: :destroy
  has_many   :voters,           through: :upvotes, source: :user
  has_many   :issue_status_logs, dependent: :destroy
  has_many   :staff_assignments, dependent: :destroy
  has_many   :assigned_staff,   through: :staff_assignments, source: :staff
  has_one_attached :photo

  validates :title,       presence: true, length: { minimum: 5, maximum: 120 }
  validates :description, presence: true, length: { minimum: 10 }
  validates :location,    presence: true
  validates :category,    inclusion: { in: CATEGORIES }
  validates :status,      inclusion: { in: STATUSES }

  scope :by_priority,  -> { order(upvotes_count: :desc, created_at: :desc) }
  scope :raised,       -> { where(status: "raised") }
  scope :processed,    -> { where(status: "processed") }
  scope :being_resolved, -> { where(status: "being_resolved") }
  scope :resolved,     -> { where(status: "resolved") }
  scope :open,         -> { where.not(status: "resolved") }
  scope :for_category, ->(cat) { where(category: cat) if cat.present? }
  scope :for_status,   ->(st)  { where(status: st) if st.present? }
  scope :recent,       -> { order(created_at: :desc) }
  scope :trending,     -> { order(upvotes_count: :desc).limit(3) }

  after_update :log_status_change, if: :saved_change_to_status?

  def next_status
    idx = STATUS_ORDER[status]
    STATUSES[idx + 1] if idx < STATUSES.length - 1
  end

  def can_advance?
    status != "resolved"
  end

  def hot?
    upvotes_count >= 5
  end

  def status_color
    STATUS_COLORS[status]
  end

  def upvoted_by?(user)
    upvotes.exists?(user_id: user.id)
  end

  private

  def log_status_change
    # IssueStatusLog is written explicitly by the service, not here
    # This callback is intentionally left light
  end
end
