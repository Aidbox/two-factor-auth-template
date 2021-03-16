two_factor_policy = {
    "engine": "json-schema",
    "schema": {
        "required": ["user"],
        "properties": {
            "uri": {
                "type": "string",
                "pattern": "^/app/auth/two-factor/request|/app/auth/two-factor/confirm$",
            },
        },
    },
}

access_policies = {
    "two-factor": two_factor_policy,
}
