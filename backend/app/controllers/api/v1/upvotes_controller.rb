module Api
  module V1
    class UpvotesController < ApplicationController
      def toggle
        issue   = Issue.find(params[:issue_id])
        service = Upvotes::ToggleUpvoteService.new(user: current_user, issue: issue)

        if service.call
          render_success({
            action:       service.action,
            upvotes_count: issue.reload.upvotes_count
          })
        else
          render_errors(service.errors)
        end
      end
    end
  end
end
