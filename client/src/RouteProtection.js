import React, { Fragment, useEffect, useState } from 'react';
import Cookies from 'universal-cookie';

export function VerifyUserTokens() {
	useState(() => {
		async function start() {
			const cookies = new Cookies();

			const isAccessTokenOk = await isAccessTokenValid();
			if (isAccessTokenOk) {
				return (window.location.href = '/messages');
			}

			const isRefreshTokenOk = await isRefreshTokenValid();

			if (!isRefreshTokenOk) {
				cookies.remove('access_token', { path: '/' });
				return (window.location.href = '/');
			}

			const newAccessToken = await generateAccessToken();
			cookies.set('access_token', newAccessToken, { path: '/' });
			window.location.reload();
		}

		start();
	});

	return <Fragment></Fragment>;
}

async function generateAccessToken() {
	const cookies = new Cookies();
	return await new Promise((resolve) => {
		fetch(process.env.REACT_APP_API_URI + '/auth/generate-new-access-token', {
			method: 'GET',
			headers: { Authorization: 'Bearer ' + cookies.get('access_token') },
		})
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				resolve(response.newAccessToken);
			});
	});
}

async function isAccessTokenValid() {
	const cookies = new Cookies();

	return new Promise((resolve) => {
		fetch(process.env.REACT_APP_API_URI + '/auth/is-access-token-valid', {
			method: 'POST',
			headers: { Authorization: 'Bearer ' + cookies.get('access_token') },
		})
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				resolve(response.isAuth);
			});
	});
}

async function isRefreshTokenValid() {
	const cookies = new Cookies();

	return new Promise((resolve) => {
		fetch(process.env.REACT_APP_API_URI + '/auth/check-refresh-token', {
			method: 'POST',
			headers: { Authorization: 'Bearer ' + cookies.get('access_token') },
		})
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				resolve(response.isOk);
			});
	});
}

//
// ROUTE PROTECTIONS
//

// Must not logged in to access
export function UnprotectedRoute({ component: Component, ...rest }) {
	const [isAuth, setAuth] = useState(null);

	useEffect(() => {
		async function verifyAuth() {
			const auth = await isAccessTokenValid();
			setAuth(auth);

			if (auth) {
				window.location.href = rest.redirect;
			}
		}
		verifyAuth();
	}, [setAuth, rest.redirect]);

	return <Fragment>{!isAuth && isAuth !== null ? <Component /> : null}</Fragment>;
}

// Must logged in to access
export function ProtectedRoute({ component: Component, ...rest }) {
	const [isAuth, setAuth] = useState(null);

	useEffect(() => {
		async function verifyAuth() {
			const auth = await isAccessTokenValid();
			setAuth(auth);

			if (!auth) {
				window.location.href = rest.redirect;
			}
		}
		verifyAuth();
	}, [setAuth, rest.redirect]);

	return <Fragment>{isAuth && isAuth !== null ? <Component /> : null}</Fragment>;
}
