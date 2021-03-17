import QRCode from 'qrcode.react';
import React from 'react';
import { useHistory } from 'react-router';

import { isSuccess } from 'aidbox-react/lib/libs/remoteData';
import { formatError } from 'aidbox-react/lib/utils/error';

import { confirmTwoFactor, requestTwoFactor } from './services';
import s from './TwoFactor.module.css'

interface Props {
    reload: () => void;
}

interface ConfirmationState {
    uri?: string;
}

function useTwoFactor(props: Props) {
    const history = useHistory();
    const [token, setToken] = React.useState('');
    const [error, setError] = React.useState<string | undefined>();
    const { reload } = props;
    const [confirmationState, setConfirmationState] = React.useState<ConfirmationState | null>(
        null,
    );

    const request = async (transport?: string) => {
        const response = await requestTwoFactor({ transport });

        if (isSuccess(response)) {
            setConfirmationState(response.data);
        } else {
            alert(formatError(response.error));
        }
    };
    const confirm = async () => {
        setError(undefined);

        const response = await confirmTwoFactor({ token });

        if (isSuccess(response)) {
            reload();
            history.push('/app');
        } else {
            setError(formatError(response.error));
        }
    };

    const skip = () => {
        history.push('/app');
    };

    return { confirmationState, request, skip, confirm, token, setToken, error };
}

export function TwoFactor(props: Props) {
    const {
        confirmationState,
        request,
        skip,
        confirm,
        setToken,
        token,
        error
    } = useTwoFactor(props);

    if (confirmationState) {
        return (
            <div className={s.content}>
                {confirmationState.uri && (
                    <div>
                        <div>
                            Please, scan this code with any OTP authenticator mobile app. You need
                            to download it first.
                        </div>
                        <br/>
                        <QRCode
                            value={confirmationState.uri}
                            size={128}
                            level="M"
                        />
                    </div>
                )}

                <div>
                    <div>Input the token to finish setting up two-factor authentication</div>
                </div>
                <br/>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    return confirm();
                }}>
                    {error && <div className={s.error}>{error}</div>}

                    <input
                        type="number"
                        autoComplete="off"
                        autoFocus
                        name="token"
                        placeholder="Input token here"
                        className={s.input}
                        value={token}
                        onChange={(event) => setToken(event.currentTarget.value)}
                    />
                    <button type="submit" className={s.input}>Confirm</button>
                </form>
            </div>
        );
    }

    return (
        <div className={s.content}>
            <div>Do you want to enable two-factor authentication right now?</div>
            <br/>
            <br/>
            <div>
                <button onClick={() => request()} className={s.input}>
                    Enable using Authenticator app
                </button>
            </div>
            <br/>
            <div>
                <button onClick={skip} className={s.input}>
                    Skip this step
                </button>
            </div>
        </div>
    );
}
