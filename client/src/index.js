import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Footer from './Components/Footer';
import './styles/style.css';

ReactDOM.render(
	<React.StrictMode>
		<div className='app'>
			<App />
			<Footer />
		</div>
	</React.StrictMode>,
	document.getElementById('root')
);
