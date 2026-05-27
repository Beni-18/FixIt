Rails.application.routes.draw do
  devise_for :users,
    path: "api/v1/auth",
    path_names: {
      sign_in:  "login",
      sign_out: "logout",
      registration: "register"
    },
    controllers: {
      sessions:      "api/v1/sessions",
      registrations: "api/v1/registrations"
    }

  namespace :api do
    namespace :v1 do
      # Auth & profile
      get    "auth/me",               to: "auth#me"
      patch  "auth/profile",          to: "auth#update_profile"
      post   "auth/upload_id_card",   to: "auth#upload_id_card"

      # Issues feed (students & admins)
      resources :issues, only: [:index, :show, :create, :update, :destroy] do
        resources :comments, only: [:create, :update, :destroy]
        post "upvote", to: "upvotes#toggle"
      end

      # Public stats (no auth required)
      get "stats", to: "stats#index"

      # Chat (stub for chatbot)
      post "chat",         to: "chat#create"
      get  "chat/history", to: "chat#history"

      # Admin namespace — all actions behind admin guard
      namespace :admin do
        get  "dashboard", to: "dashboard#index"

        resources :issues, only: [:index, :show, :destroy] do
          patch "status",       to: "issues#update_status"
          post  "assign_staff", to: "issues#assign_staff"
        end

        resources :users, only: [:index, :show, :destroy] do
          patch "verify",        to: "users#verify"
          patch "toggle_active", to: "users#toggle_active"
        end

        get "staff_list", to: "users#staff_list"
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
