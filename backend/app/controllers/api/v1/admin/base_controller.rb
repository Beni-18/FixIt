module Api
  module V1
    module Admin
      class BaseController < Api::V1::ApplicationController
        before_action :require_admin!

        private

        def require_admin!
          render_error("Admin access required", status: :forbidden) unless current_user&.admin?
        end
      end
    end
  end
end
