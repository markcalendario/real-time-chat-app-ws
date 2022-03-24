import React, { useEffect, useState } from 'react';
import { Container, Wrapper } from './Base';

export default function Footer() {
	const [year, updateYear] = useState(0);

	useEffect(() => {
		updateYear(new Date().getFullYear());
	}, [updateYear]);

	return (
		<footer>
			<Container>
				<Wrapper>
					<a href='https://www.markcalendario.tk'>Mark Kenneth Calendario</a>
					<p>&copy; {year}</p>
					<p>GitHub | Facebook</p>
				</Wrapper>
			</Container>
		</footer>
	);
}
