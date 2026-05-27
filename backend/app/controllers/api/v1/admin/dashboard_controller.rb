module Api
  module V1
    module Admin
      class DashboardController < BaseController
        def index
          render_success({
            stats: {
              total_issues:      Issue.count,
              raised:            Issue.raised.count,
              processed:         Issue.processed.count,
              being_resolved:    Issue.being_resolved.count,
              resolved:          Issue.resolved.count,
              total_users:       User.students.count,
              verified_users:    User.students.verified.count,
              total_upvotes:     Upvote.count,
              total_comments:    Comment.count
            },
            top_issues:         IssueBlueprint.render_as_hash(
                                  Issue.by_priority.limit(5),
                                  view: :feed
                                ),
            recent_issues:      IssueBlueprint.render_as_hash(
                                  Issue.recent.limit(5),
                                  view: :feed
                                ),
            issues_by_category: Issue.group(:category).count,
            issues_by_location: Issue.group(:location).order("count_all desc").limit(10).count
          })
        end
      end
    end
  end
end
