from app import config

meta_resources =  {
    "Client": {
        "SPA": {"secret": "123456", "grant_types": ["password"]},
        "google-client": {
            "auth": {
                "authorization_code": {
                    "redirect_uri": "{}/google-signin".format(config.frontend_url)
                }
            },
            "first_party": True,
            "grant_types": ["authorization_code"],
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
