class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  ROLES = %w[student admin staff].freeze

  has_many :issues,           dependent: :restrict_with_exception
  has_many :comments,         dependent: :destroy
  has_many :upvotes,          dependent: :destroy
  has_many :upvoted_issues,   through: :upvotes, source: :issue
  has_many :issue_status_logs, foreign_key: :changed_by_id, dependent: :destroy
  has_many :staff_assignments, foreign_key: :staff_id, dependent: :nullify
  has_many :assigned_issues,   through: :staff_assignments, source: :issue
  has_many :chat_sessions,    dependent: :destroy
  has_one_attached :id_card_image

  validates :name,  presence: true, length: { minimum: 2, maximum: 100 }
  validates :role,  inclusion: { in: ROLES }
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: /\A[^@\s]+@[^@\s]+\z/ }
  validates :student_id, uniqueness: { allow_blank: true }

  scope :students,  -> { where(role: "student") }
  scope :admins,    -> { where(role: "admin") }
  scope :staff,     -> { where(role: "staff") }
  scope :verified,  -> { where(verified: true) }
  scope :active,    -> { where(active: true) }

  def student? = role == "student"
  def admin?   = role == "admin"
  def staff?   = role == "staff"

  def display_name
    name.presence || email.split("@").first
  end

  def upvoted?(issue)
    upvotes.exists?(issue_id: issue.id)
  end
end
