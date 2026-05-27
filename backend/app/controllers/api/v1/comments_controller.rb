module Api
  module V1
    class CommentsController < ApplicationController
      before_action :set_issue
      before_action :set_comment, only: [:update, :destroy]

      def create
        authorize Comment

        comment = @issue.comments.new(
          content: comment_params[:content],
          user:    current_user
        )

        if comment.save
          render_success(CommentBlueprint.render_as_hash(comment), status: :created)
        else
          render_errors(comment.errors.full_messages)
        end
      end

      def update
        authorize @comment

        if @comment.update(content: comment_params[:content])
          render_success(CommentBlueprint.render_as_hash(@comment))
        else
          render_errors(@comment.errors.full_messages)
        end
      end

      def destroy
        authorize @comment
        @comment.destroy!
        render_success({ message: "Comment deleted" })
      end

      private

      def set_issue
        @issue = Issue.find(params[:issue_id])
      end

      def set_comment
        @comment = @issue.comments.find(params[:id])
      end

      def comment_params
        params.require(:comment).permit(:content)
      end
    end
  end
end
