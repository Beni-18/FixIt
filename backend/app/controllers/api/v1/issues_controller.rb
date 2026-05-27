module Api
  module V1
    class IssuesController < ApplicationController
      before_action :set_issue, only: [:show, :update, :destroy]

      def index
        per_page = (params[:per_page]&.to_i || 12).then { |n| [[n, 1].max, 100].min }
        issues = filtered_issues.paginate(page: params[:page], per_page: per_page)
        render_paginated(issues, blueprint: IssueBlueprint, view: :feed,
                         current_user: current_user, url_helpers: url_helpers)
      end

      def show
        render_success(IssueBlueprint.render_as_hash(@issue, view: :detail,
          current_user: current_user, url_helpers: url_helpers))
      end

      def create
        authorize Issue

        service = Issues::CreateIssueService.new(
          user:   current_user,
          params: issue_params
        ).call

        if service
          render_success(IssueBlueprint.render_as_hash(service, view: :feed,
            current_user: current_user, url_helpers: url_helpers),
            status: :created)
        else
          render_errors(Issues::CreateIssueService.new(user: current_user, params: issue_params).errors)
        end
      end

      def update
        authorize @issue

        if @issue.update(update_params)
          render_success(IssueBlueprint.render_as_hash(@issue, view: :feed,
            current_user: current_user, url_helpers: url_helpers))
        else
          render_errors(@issue.errors.full_messages)
        end
      end

      def destroy
        authorize @issue
        @issue.destroy!
        render_success({ message: "Issue deleted" })
      end

      private

      def set_issue
        @issue = Issue.find(params[:id])
      end

      def filtered_issues
        scope = Issue.includes(:user).by_priority

        scope = scope.for_status(params[:status])   if params[:status].present?
        scope = scope.for_category(params[:category]) if params[:category].present?

        if params[:my_issues].present? && ActiveModel::Type::Boolean.new.cast(params[:my_issues])
          scope = scope.where(user_id: current_user.id)
        end

        scope
      end

      def issue_params
        params.require(:issue).permit(:title, :description, :location,
                                      :category, :photo)
      end

      def update_params
        params.require(:issue).permit(:title, :description, :location, :category)
      end
    end
  end
end
