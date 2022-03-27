import React, { Fragment, useState } from 'react';
import { Container, Section, Wrapper } from '../Components/Base';
import Button from '../Components/Buttons';
import { FormInput, FormResponse } from '../Components/Forms';
import { LargeScreenHeaderFront } from '../Components/Header';
import Cookies from 'universal-cookie';

export function Login() {
	const [formResponse, setFormResponse] = useState(null);

	function handleSignIn() {
		setFormResponse(null);
		fetch(process.env.REACT_APP_API_URI + '/users/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: document.getElementById('email').value,
				password: document.getElementById('password').value,
			}),
		})
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				setFormResponse(response);

				if (!response.formError) {
					const cookies = new Cookies();
					cookies.set('access_token', response.accessToken, { path: '/' });
					window.location.reload();
				}
			});
	}

	return (
		<Fragment>
			<LargeScreenHeaderFront />
			<Section id='login'>
				<Container>
					<Wrapper>
						<div className='box'>
							<div className='avatar'>
								<img src={require('../assets/logo.png')} alt='Logo' />
								<h1>Login</h1>
							</div>
							<form>
								{formResponse !== null ? (
									<FormResponse
										type={formResponse.formError === true ? 'error' : 'success'}
										text={formResponse.message}
									/>
								) : null}
								<FormInput id='email' placeholder='Email' />
								<FormInput id='password' type='password' placeholder='Password' />
								<Button onClick={handleSignIn} btnStyle='solid-btn-main'>
									Sign In
								</Button>
								<a href='/recover'>Forgot Password?</a>
								<a href='/register'>No account yet? Register here.</a>
							</form>
						</div>
					</Wrapper>
				</Container>
			</Section>
		</Fragment>
	);
}

export function Register() {
	const [formResponse, setFormResponse] = useState(null);

	function handleRegisterClick() {
		setFormResponse(null);
		fetch(process.env.REACT_APP_API_URI + '/users/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				firstName: document.getElementById('first-name').value,
				lastName: document.getElementById('last-name').value,
				email: document.getElementById('email').value,
				password: document.getElementById('password').value,
			}),
		})
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				setFormResponse(response);

				if (!response.formError) {
					document.getElementById('register-form').reset();
					setTimeout(() => {
						window.location.href = '/';
					}, 3000);
				}
			});
	}

	return (
		<Fragment>
			<LargeScreenHeaderFront />
			<Section id='register'>
				<Container>
					<Wrapper>
						<div className='box'>
							<div className='avatar'>
								<img src={require('../assets/logo.png')} alt='Logo' />
								<h1>Register</h1>
							</div>

							<form id='register-form'>
								{formResponse !== null ? (
									<FormResponse
										type={formResponse.formError === true ? 'error' : 'success'}
										text={formResponse.message}
									/>
								) : null}
								<FormInput id='first-name' placeholder='First Name' />
								<FormInput id='last-name' placeholder='Last Name' />
								<FormInput id='email' placeholder='Email' />
								<FormInput id='password' type='password' placeholder='Password' />
								<Button onClick={handleRegisterClick} btnStyle='solid-btn-main'>
									Sign Up
								</Button>
								<a href='/'>Already registered? Login here.</a>
							</form>
						</div>
					</Wrapper>
				</Container>
			</Section>
		</Fragment>
	);
}
