import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error){
    return { hasError: true, error };
  }
  componentDidCatch(_error, _info){
    // Could log to analytics here
    // console.error('ErrorBoundary', error, info);
  }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:'1rem', color:'#6b3f22'}}>
          <h2 style={{fontWeight:700}}>Something went wrong.</h2>
          <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
