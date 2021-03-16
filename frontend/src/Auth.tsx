import queryString from 'query-string';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { parseOAuthState, setToken } from './services';

export function Auth() {
    const location = useLocation();

    React.useEffect(() => {
        const queryParams = queryString.parse(location.hash);
        if (queryParams.access_token) {
            setToken(queryParams.access_token as string);
            const state = parseOAuthState(queryParams.state as string | undefined);

            window.location.href = state.nextUrl ?? '/';
        }
    }, [location.hash]);

    return null;
}
