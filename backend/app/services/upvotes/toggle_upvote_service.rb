module Upvotes
  class ToggleUpvoteService
    attr_reader :errors, :action

    def initialize(user:, issue:)
      @user   = user
      @issue  = issue
      @errors = []
      @action = nil
    end

    def call
      existing = Upvote.find_by(user_id: @user.id, issue_id: @issue.id)

      if existing
        existing.destroy!
        @action = :removed
      else
        upvote = Upvote.new(user_id: @user.id, issue_id: @issue.id)
        unless upvote.save
          @errors = upvote.errors.full_messages
          return false
        end
        @action = :added
      end

      true
    rescue ActiveRecord::RecordNotDestroyed => e
      @errors << e.message
      false
    end
  end
end
