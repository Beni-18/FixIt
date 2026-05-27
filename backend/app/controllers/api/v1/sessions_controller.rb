module Api
  module V1
    class SessionsController < Devise::SessionsController
      respond_to :json

      private

      def respond_with(resource, _opts = {})
        render json: {
          message: "Logged in successfully",
          user:    UserBlueprint.render_as_hash(resource, view: :profile)
        }, status: :ok
      end

      def respond_to_on_destroy
        render json: { message: "Logged out successfully" }, status: :ok
      end
    end
  end
end
