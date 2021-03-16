import os

app_superadmin_email = os.environ.get("APP_SUPERADMIN_EMAIL", "admin@health-samurai.io")
app_superadmin_password = os.environ.get(
    "APP_SUPERADMIN_PASSWORD", os.environ.get("AIDBOX_ADMIN_PASSWORD")
)
oauth_provider_name = os.environ.get("OAUTH_PROVIDER_NAME", "Demo")

secret_key = os.environ.get("SECRET_KEY", "").encode()

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
backend_public_url = os.environ.get("BACKEND_PUBLIC_URL", "http://localhost:8080")
backend_internal_url = os.environ.get("APP_INIT_URL", "http://devbox:8080")
root_dir = os.path.dirname(os.path.abspath(__name__))

two_factor_webhook_client_secret = os.environ.get(
    "TWO_FACTOR_CLIENT_SECRET", "two-factor-webhook"
)
two_factor_valid_past_tokens_count = 5
