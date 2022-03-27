import React from 'react';
import { FaFacebookSquare, FaGithubSquare } from 'react-icons/fa';
import { Container, Wrapper } from './Base';

export default function Footer() {
	return (
		<footer>
			<Container>
				<Wrapper>
					<a target='_blank' rel='noreferrer' href='https://markcalendario.tk'>
						Mark Kenneth Calendario
					</a>

					<div className='links'>
						<a target='_blank' rel='noreferrer' href='https://github.com/markcalendario'>
							<FaGithubSquare />
						</a>

						<a target='_blank' rel='noreferrer' href='https://facebook.com/markcalendario'>
							<FaFacebookSquare />
						</a>
					</div>
				</Wrapper>
			</Container>
		</footer>
	);
}
