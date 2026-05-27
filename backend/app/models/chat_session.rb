class ChatSession < ApplicationRecord
  belongs_to :user

  validates :status, inclusion: { in: %w[active closed] }

  scope :active, -> { where(status: "active") }

  def add_message(role:, content:)
    messages << { role: role, content: content, timestamp: Time.current.iso8601 }
    save!
  end
end
