module Api
  module V1
    class RegistrationsController < Devise::RegistrationsController
      respond_to :json

      private

      def respond_with(resource, _opts = {})
        if resource.persisted?
          render json: {
            message: "Registered successfully",
            user:    UserBlueprint.render_as_hash(resource, view: :profile)
          }, status: :created
        else
          render json: {
            errors: resource.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      def sign_up_params
        params.require(:user).permit(:name, :email, :password,
                                     :password_confirmation, :student_id,
                                     :phone, :department)
      end
    end
  end
end
