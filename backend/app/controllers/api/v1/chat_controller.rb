module Api
  module V1
    class ChatController < ApplicationController
      def create
        session = current_user.chat_sessions.active.first_or_create!

        session.add_message(role: "user", content: params[:message])

        # Stub response — wire in Claude/OpenAI here when ready
        bot_reply = "Thanks for your message! Our team will assist you shortly."
        session.add_message(role: "assistant", content: bot_reply)

        render_success({
          session_id: session.id,
          reply:      bot_reply,
          messages:   session.messages
        })
      end

      def history
        session = current_user.chat_sessions.active.first
        render_success({ messages: session&.messages || [] })
      end
    end
  end
end
