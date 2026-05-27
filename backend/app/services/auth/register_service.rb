module Auth
  class RegisterService
    attr_reader :errors

    def initialize(params)
      @params = params
      @errors = []
    end

    def call
      user = User.new(permitted_params)
      user.role = "student" # registration always creates students

      unless user.save
        @errors = user.errors.full_messages
        return nil
      end

      user
    end

    private

    def permitted_params
      @params.slice(:name, :email, :password, :password_confirmation,
                    :student_id, :phone, :department)
    end
  end
end
