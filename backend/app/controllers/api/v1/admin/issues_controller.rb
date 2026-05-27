module Api
  module V1
    module Admin
      class IssuesController < BaseController
        before_action :set_issue, only: [:show, :update_status, :assign_staff, :destroy]

        def index
          issues = filtered_issues.paginate(page: params[:page], per_page: 15)
          render_paginated(issues, blueprint: IssueBlueprint, view: :detail,
                           url_helpers: url_helpers)
        end

        def show
          render_success(IssueBlueprint.render_as_hash(@issue, view: :detail,
            url_helpers: url_helpers))
        end

        def update_status
          service = Issues::UpdateStatusService.new(
            issue:      @issue,
            new_status: params[:status],
            admin:      current_user,
            note:       params[:note]
          )

          if service.call
            render_success(IssueBlueprint.render_as_hash(@issue.reload, view: :detail,
              url_helpers: url_helpers))
          else
            render_errors(service.errors)
          end
        end

        def assign_staff
          staff   = User.staff.find(params[:staff_id])
          service = Admin::AssignStaffService.new(
            issue:       @issue,
            staff:       staff,
            assigned_by: current_user,
            note:        params[:note]
          )

          if service.call
            render_success({ message: "Staff assigned successfully" })
          else
            render_errors(service.errors)
          end
        end

        def destroy
          @issue.destroy!
          render_success({ message: "Issue removed" })
        end

        private

        def set_issue
          @issue = Issue.find(params[:id])
        end

        def filtered_issues
          scope = Issue.includes(:user, :comments, :upvotes, :staff_assignments).by_priority

          scope = scope.for_status(params[:status])     if params[:status].present?
          scope = scope.for_category(params[:category]) if params[:category].present?

          if params[:search].present?
            term  = "%#{params[:search].downcase}%"
            scope = scope.where("lower(title) LIKE ? OR lower(location) LIKE ?", term, term)
          end

          scope
        end
      end
    end
  end
end
