module Api
  module V1
    class ApplicationController < ::ApplicationController
      private

      def render_success(data, status: :ok)
        render json: data, status: status
      end

      def render_error(message, status: :unprocessable_entity)
        render json: { error: message }, status: status
      end

      def render_errors(messages, status: :unprocessable_entity)
        render json: { errors: Array(messages) }, status: status
      end

      def render_paginated(collection, blueprint:, view: :default, **opts)
        render json: {
          data: blueprint.render_as_hash(collection, view: view, **opts),
          meta: pagination_meta(collection)
        }
      end
    end
  end
end
