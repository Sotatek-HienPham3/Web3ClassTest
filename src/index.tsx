import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Web3Provider } from '@ethersproject/providers';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import 'antd/dist/antd.css';
import './index.scss';


const getLibrary = (provider: any) => {
  // depend on web3 or ethers
  const library = new Web3Provider(provider);
  return library;
}

const Web3ProviderNetwork = createWeb3ReactRoot("NETWORK");

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <App />
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
