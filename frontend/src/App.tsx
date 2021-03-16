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
                <header className={s.header}>
                    <div>
                        <button
                            style={{ marginTop: 15 }}
                            onClick={() => authorize()}
                        >
                            Login
                        </button>
                        <span> </span>
                        <button
                            style={{ marginTop: 15 }}
                            onClick={() => signup()}
                        >
                            Sign up
                        </button>
                    </div>
                </header>
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
                        <div>Hello!

                            <button onClick={doLogout}>Logout</button>
                        </div>
                    )}
                />
                <Route path="/two-factor"
                       render={() => <TwoFactor reload={reloadUser} user={user}/>}/>

                <Redirect
                    to={
                        user.twoFactor?.enabled
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
