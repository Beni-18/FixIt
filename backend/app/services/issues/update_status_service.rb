module Issues
  class UpdateStatusService
    attr_reader :errors

    def initialize(issue:, new_status:, admin:, note: nil)
      @issue      = issue
      @new_status = new_status
      @admin      = admin
      @note       = note
      @errors     = []
    end

    def call
      unless Issue::STATUSES.include?(@new_status)
        @errors << "Invalid status '#{@new_status}'"
        return false
      end

      if @issue.status == @new_status
        @errors << "Issue is already #{@new_status}"
        return false
      end

      old_status = @issue.status

      ActiveRecord::Base.transaction do
        @issue.update!(status: @new_status)
        IssueStatusLog.create!(
          issue:        @issue,
          changed_by:   @admin,
          from_status:  old_status,
          to_status:    @new_status,
          note:         @note
        )
      end

      true
    rescue ActiveRecord::RecordInvalid => e
      @errors << e.message
      false
    end
  end
end
