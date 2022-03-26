
import { useWeb3React } from '@web3-react/core';
import './App.css';
import DefaultLayout from './components/layouts';
import StakingPool from './components/staking-pool';
import 'antd/dist/antd.css';

const App = () =>{
  const { account } = useWeb3React();
  console.log(account);
  
  return <DefaultLayout>
   {account ? <StakingPool/> : null} 
  </DefaultLayout>
}

export default App;
