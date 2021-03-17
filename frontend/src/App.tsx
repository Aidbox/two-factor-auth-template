import React from 'react';
import { Route, Switch, Router, Redirect } from 'react-router-dom';

import { useService } from 'aidbox-react/lib/hooks/service';
import { isFailure, isLoading, isNotAsked, success } from 'aidbox-react/lib/libs/remoteData';
import { resetInstanceToken, setInstanceToken } from 'aidbox-react/lib/services/instance';
import { extractErrorCode, formatError } from 'aidbox-react/lib/utils/error';

import { User } from './aidbox';
import { Auth } from './Auth';
import { TwoFactor } from './TwoFactor';
import {
    getAuthorizeUrl,
    getSignupUrl,
    getToken,
    getUserInfo,
    removeToken,
    logout,
    OAuthState,
} from './services';
import { history } from './history';

import s from './App.module.css';

function useApp() {
    const [userResponse, { reload: reloadUser }] = useService(async () => {
        const appToken = getToken();

        if (!appToken) {
            return success(null);
        }

        setInstanceToken({ access_token: appToken, token_type: 'Bearer' });

        const response = await getUserInfo();

        if (isFailure(response)) {
            if (extractErrorCode(response.error) !== 'network_error') {
                resetInstanceToken();
                removeToken();

                return success(null);
            }
        }

        return response;
    });

    const authorize = (state?: OAuthState) => {
        window.location.href = getAuthorizeUrl(state);
    };

    const signup = () => {
        window.location.href = getSignupUrl();
    };
    const doLogout = async () => {
        await logout();
        resetInstanceToken();
        removeToken();
        window.location.href = '/';
    };

    return {
        authorize,
        userResponse,
        signup,
        reloadUser,
        doLogout,
    };
}

export function App() {
    const { userResponse, authorize, signup, reloadUser, doLogout } = useApp();

    const renderAnonymousRoutes = () => (
        <Switch>
            <Route path="/auth" exact>
                <Auth/>
            </Route>
            <Route path="/signin" exact>
                <div className={s.container}>
                    <button
                        style={{ marginTop: 15 }}
                        onClick={() => authorize()}
                        className={s.input}
                    >
                        Login
                    </button>
                    <span> </span>
                    <button
                        style={{ marginTop: 15 }}
                        onClick={() => signup()}
                        className={s.input}
                    >
                        Sign up
                    </button>
                </div>
            </Route>
            <Redirect
                to={{
                    pathname: '/signin',
                    state: { referrer: history.location.pathname },
                }}
            />
        </Switch>
    );

    const renderAuthorizedRoutes = (user: User) => {
        return (
            <Switch>

                <Route
                    path="/app"
                    render={() => (
                        <div className={s.container}>
                            <div className={s.header}>Hello, {user.email || user.id}!</div>

                            <button onClick={doLogout} className={s.input}>Logout</button>
                        </div>
                    )}
                />
                <Route path="/two-factor"
                       render={() => <TwoFactor reload={reloadUser}/>}/>

                <Redirect
                    to={
                        !user.email || user.twoFactor?.enabled
                            ? '/app'
                            : '/two-factor'
                    }
                />
            </Switch>
        );
    };

    const renderRoutes = () => {
        if (isLoading(userResponse) || isNotAsked(userResponse)) {
            return 'Loading...'
        }

        if (isFailure(userResponse)) {
            return formatError(userResponse.error)
        }

        const user = userResponse.data;

        return user ? renderAuthorizedRoutes(user) : renderAnonymousRoutes();

    };

    return (
        <Router history={history}>
            <Switch>{renderRoutes()}</Switch>
        </Router>
    );
}
