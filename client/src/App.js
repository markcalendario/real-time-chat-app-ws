import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Login, Register } from './Pages/LoginRegister';
import Messages from './Pages/Messages';
import { ProtectedRoute, UnprotectedRoute, VerifyUserTokens } from './RouteProtection';

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/auth' element={<VerifyUserTokens />} />

				<Route path='/' element={<UnprotectedRoute redirect='/auth' component={Login} />} />
				<Route
					path='/register'
					element={<UnprotectedRoute redirect='/auth' component={Register} />}
				/>
				<Route
					path='/messages'
					element={<ProtectedRoute redirect='/auth' component={Messages} />}
				/>
			</Routes>
		</Router>
	);
}

export default App;
