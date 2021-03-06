import React, { Component } from 'react'
import authService from '../../lib/auth-service';
import LoadingScreen from '../loadingScreen/LoadingScreen';


export const AuthContext = React.createContext(
  // authStore // default value
);

export const { Provider, Consumer }  = AuthContext;

export const withAuth = (Comp) => {
  return class WithAuth extends Component {
    render() {
      return (
        <Consumer>
          {(authStore) => {
            return <Comp
              isLogged={authStore.isLogged}
              user={authStore.user}
              logout={authStore.logout}
              login={authStore.login}
              signup={authStore.signup}
              {...this.props} />
          }}
        </Consumer>
      )
    }    
  }
}

export default class AuthProvider extends Component {
  state = {
    isLogged: false,
    user: {},
    status: 'loading'
  }

  setUser = (user) => {
    this.setState({
      isLogged: true,
      user,
    })
  }

  logoutUser = () => {
    return authService.logout()
      .then(() => {
        this.setState({ 
          isLogged: false,
          user: {},
        });
      })
  }

  loginUser = (body) => {
    return authService.login(body)
      .then((user) => {
        this.setUser(user);
      })
  }

  signupUser = (body) => {
    return authService.signup(body)
      .then((user) => {
        this.setUser(user);
      })
      
  }

  componentDidMount() {
    authService.me()
      .then((user) => {
        this.setState({
          isLogged: true,
          user,
          status: 'loaded'
        })
      })
      .catch((error) => {
        this.setState({ 
          isLogged: false,
          user: {},
          status: 'loaded'
        });
      })
  }

  render() {
    const { isLogged, user, status } = this.state;
    const { children } = this.props;
    switch (status) {
      case 'loading':
        return < LoadingScreen />
      default:
        return (
          <Provider value={
            { isLogged,
              user,
              logout: this.logoutUser, 
              login: this.loginUser,
              signup: this.signupUser,
            }}>
            {children}
          </Provider>    
        );
    }
  }
}