module Issues
  class CreateIssueService
    attr_reader :errors

    def initialize(user:, params:)
      @user   = user
      @params = params
      @errors = []
    end

    def call
      issue = @user.issues.new(permitted_params)

      if @params[:photo].present?
        issue.photo.attach(@params[:photo])
      end

      unless issue.save
        @errors = issue.errors.full_messages
        return nil
      end

      issue
    end

    private

    def permitted_params
      @params.slice(:title, :description, :location, :category)
    end
  end
end
