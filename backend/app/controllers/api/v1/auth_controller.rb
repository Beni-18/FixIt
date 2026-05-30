module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:register]

      def register
        result = Auth::RegisterService.new(register_params).call

        if result
          render_success(
            UserBlueprint.render_as_hash(result, view: :profile),
            status: :created
          )
        else
          render_errors(result.nil? ? ["Registration failed"] : [])
        end
      end

      def me
        render_success(
          UserBlueprint.render_as_hash(current_user, view: :profile,
            url_helpers: url_helpers, base_url: request.base_url)
        )
      end

      def update_profile
        if current_user.update(profile_params)
          render_success(UserBlueprint.render_as_hash(current_user, view: :profile,
            url_helpers: url_helpers, base_url: request.base_url))
        else
          render_errors(current_user.errors.full_messages)
        end
      end

      def upload_id_card
        current_user.id_card_image.attach(params[:id_card_image])

        if current_user.id_card_image.attached?
          render_success({ message: "ID card uploaded. Awaiting admin verification." })
        else
          render_error("Failed to upload ID card")
        end
      end

      private

      def register_params
        params.require(:user).permit(:name, :email, :password,
                                     :password_confirmation, :student_id,
                                     :phone, :department)
      end

      def profile_params
        params.require(:user).permit(:name, :phone, :department, :student_id)
      end
    end
  end
end
