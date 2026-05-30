module Api
  module V1
    module Admin
      class UsersController < BaseController
        before_action :set_user, only: [:show, :verify, :toggle_active, :destroy]

        def index
          users = filtered_users.paginate(page: params[:page], per_page: 20)
          render_paginated(users, blueprint: UserBlueprint, view: :admin,
                           url_helpers: url_helpers, base_url: request.base_url)
        end

        def show
          render_success(UserBlueprint.render_as_hash(@user, view: :admin,
            url_helpers: url_helpers, base_url: request.base_url))
        end

        def staff_list
          render_success(UserBlueprint.render_as_hash(User.staff.active, view: :public))
        end

        def verify
          @user.update!(verified: !@user.verified)
          render_success({ verified: @user.verified, message: "Verification status updated" })
        end

        def toggle_active
          @user.update!(active: !@user.active)
          render_success({ active: @user.active, message: "User status updated" })
        end

        def destroy
          render_error("Cannot delete admin accounts") and return if @user.admin?
          @user.destroy!
          render_success({ message: "User deleted" })
        end

        private

        def set_user
          @user = User.find(params[:id])
        end

        def filtered_users
          scope = User.order(created_at: :desc)
          scope = scope.where(role: params[:role]) if params[:role].present?
          scope = scope.where(verified: params[:verified]) if params[:verified].present?

          if params[:search].present?
            term  = "%#{params[:search].downcase}%"
            scope = scope.where("lower(name) LIKE ? OR lower(email) LIKE ?", term, term)
          end

          scope
        end
      end
    end
  end
end
