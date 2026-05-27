class Upvote < ApplicationRecord
  self.primary_key = [:user_id, :issue_id]

  belongs_to :user
  belongs_to :issue, counter_cache: true

  validates :user_id,  presence: true
  validates :issue_id, presence: true
  validates :user_id,  uniqueness: { scope: :issue_id, message: "has already upvoted this issue" }

  validate :cannot_upvote_own_issue

  private

  def cannot_upvote_own_issue
    return unless issue && user
    errors.add(:base, "You cannot upvote your own issue") if issue.user_id == user_id
  end
end
