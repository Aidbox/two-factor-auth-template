from aiohttp import BasicAuth

from app import config
from app.access_policy import access_policies

meta_resources = {
    "AccessPolicy": access_policies,
    "AuthConfig": {
        "app": {
            "twoFactor": {
                "issuerName": config.oauth_provider_name,
                "validPastTokensCount": config.two_factor_valid_past_tokens_count,
                "webhook": {
                    "endpoint": "{}/webhook/two-factor-confirmation".format(
                        config.backend_internal_url
                    ),
                    "headers": {
                        "Authorization": BasicAuth(
                            login="two-factor-webhook",
                            password=config.two_factor_webhook_client_secret,
                        ).encode()
                    },
                },
            },
        }
    },
    "Client": {
        "two-factor-webhook": {
            "secret": config.two_factor_webhook_client_secret,
            "grant_types": ["basic"],
        },
        "web": {
            "auth": {
                "implicit": {"redirect_uri": "{}/auth".format(config.frontend_url)}
            },
            "first_party": True,
            "grant_types": ["implicit"],
        },
    },
    "AidboxConfig": {
        "provider": {
            "provider": {"console": {"type": "console"}, "default": "console"},
        }
    },
}
seeds = {}
entities = {}
migrations = []
