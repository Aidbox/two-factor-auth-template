import datetime
import logging

import pyotp
from aiohttp import web
from pyotp.utils import strings_equal

from app import config
from app.sdk import sdk
from app.utils import get_error_payload

@sdk.operation(["POST"], ["webhook", "two-factor-confirmation"])
async def auth_webhook_two_factor_confirmation_op(_operation, request):
    user = sdk.client.resource("User", **request["resource"]["user"])
    token = request["resource"]["token"]
    await send_confirmation_token(user, token)
    return web.json_response({})


@sdk.operation(["POST"], ["app", "auth", "two-factor", "request"])
async def auth_two_factor_request_op(_operation, request):
    # TODO: think about throttling based on User.ts
    user = await sdk.client.resources("User").search(_id=request["oauth/user"]["id"]).get()

    if user.get_by_path(["twoFactor", "enabled"]):
        return web.json_response(
            get_error_payload("2FA is already enabled", code="already_enabled"),
            status=422,
        )

    secret_key = pyotp.random_base32()

    resource = request.get("resource", {})
    transport = resource.get("transport")

    user["twoFactor"] = {
        "enabled": False,
        "secretKey": secret_key,
        "transport": transport,
    }
    await user.save()

    if transport:
        token = generate_token(secret_key)

        await send_confirmation_token(user, token)
        return web.json_response({})

    uri = pyotp.totp.TOTP(secret_key).provisioning_uri(
        name=user["email"], issuer_name=config.oauth_provider_name
    )

    return web.json_response({"uri": uri})


@sdk.operation(["POST"], ["app", "auth", "two-factor", "confirm"])
async def auth_two_factor_confirm_op(_operation, request):
    user = await sdk.client.resources("User").search(_id=request["oauth/user"]["id"]).get()
    if not user.get("twoFactor"):
        return web.json_response(
            get_error_payload("2FA is not requested", code="not_requested"), status=422
        )

    if user["twoFactor"]["enabled"]:
        return web.json_response(
            get_error_payload("2FA is already enabled", code="already_enabled"),
            status=422,
        )

    secret_key = user["twoFactor"]["secretKey"]
    token = request["resource"].get("token")

    if not verify_token(secret_key, token):
        return web.json_response(
            get_error_payload("Wrong token", code="wrong_token"), status=422
        )

    user["twoFactor"]["enabled"] = True
    await user.save()

    return web.json_response({})


def generate_token(secret_key):
    totp = pyotp.totp.TOTP(secret_key)
    return totp.now()


def verify_token(secret_key, token):
    """Validates token considering past tokens"""
    if not token:
        return False

    totp = pyotp.totp.TOTP(secret_key)

    for_time = datetime.datetime.now()

    for i in range(-config.two_factor_valid_past_tokens_count, 1):
        if strings_equal(str(token), str(totp.at(for_time, i))):
            return True
    return False


async def send_confirmation_token(user, token):
    logging.debug(
        "OTP for user {email}: {token}".format(email=user["email"], token=token)
    )
