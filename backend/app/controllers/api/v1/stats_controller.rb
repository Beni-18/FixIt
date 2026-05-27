module Api
  module V1
    class StatsController < ApplicationController
      skip_before_action :authenticate_user!

      def index
        render json: {
          total_issues:    Issue.count,
          resolved:        Issue.resolved.count,
          active_students: User.students.active.count,
          total_upvotes:   Upvote.count
        }
      end
    end
  end
end
