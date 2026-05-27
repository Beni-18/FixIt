class Comment < ApplicationRecord
  belongs_to :issue
  belongs_to :user

  validates :content, presence: true, length: { minimum: 1, maximum: 1000 }

  scope :chronological, -> { order(created_at: :asc) }
  scope :recent,        -> { order(created_at: :desc) }
end
