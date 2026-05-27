module Admin
  class AssignStaffService
    attr_reader :errors

    def initialize(issue:, staff:, assigned_by:, note: nil)
      @issue       = issue
      @staff       = staff
      @assigned_by = assigned_by
      @note        = note
      @errors      = []
    end

    def call
      unless @staff&.staff?
        @errors << "Selected user is not a staff member"
        return false
      end

      assignment = StaffAssignment.new(
        issue:       @issue,
        staff:       @staff,
        assigned_by: @assigned_by,
        note:        @note
      )

      unless assignment.save
        @errors = assignment.errors.full_messages
        return false
      end

      true
    end
  end
end
