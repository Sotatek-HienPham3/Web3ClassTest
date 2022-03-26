import { useWeb3React } from "@web3-react/core";
import { Button, Col, notification, Row, Spin, Table } from "antd";
import styles from "./style.module.scss";
import Web3 from "web3";
import { formatAddress } from "../layouts/HeaderLayout";
import MCABI from "../../abi/Masterchef.json";
import WETHABI from "../../abi/WETH.json";
// import { getBalance } from '../../utils/web3';
import { useEffect, useState } from "react";
import StakingModal from "./staking-modal";
import WithdrawModal from "./withdraw-modal";
import {
  Multicall
} from "ethereum-multicall";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { convertTime, MAX_UINT256, URI_QUERY } from "../constant";

// eslint-disable-next-line
export const openNotification = (message: string) => {
  notification.open({
    message: message,
  });
};

const StakingPool = () => {
  const { account, library } = useWeb3React();
  const [balance, setBalance] = useState<number>(0);
  const [totalStaked, setTotalStaked] = useState<number>(0);
  const [tokenEarned, setTokenEarned] = useState<number>(0);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isVisibleStake, setVisibleStake] = useState<boolean>(false);
  const [isVisibleWithdraw, setVisibleWithdraw] = useState<boolean>(false);
  const [amountDeposited, setAmountDeposited] = useState<number>(0);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isLoadingStake, setLoadingStake] = useState<boolean>(false);
  const [isLoadingWithdraw, setLoadingWithdraw] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<any>([]);

  const web3 = new Web3(library.provider);
  const wethContract = new web3.eth.Contract(
    WETHABI as any,
    process.env.REACT_APP_WETH_ADDRESS
  );

  const masterContract = new web3.eth.Contract(
    MCABI as any,
    process.env.REACT_APP_MASTERCHEF_ADDRESS
  );

  const DATA_SUBGRAPH = gql`
    query GetDeposit {
      depositEntities(
        where: { account: "${account}" }
      ) {
        id
        account
        amount
        time
      }
      withdrawEntities(
        where: { account  : "${account}" }
      ) {
        id
        account
        amount
        time
      }
    }
  `;

  const onHarvest = async () => {
    if (!library) return;
    try {
      setVisibleStake(false);
      await masterContract.methods.deposit(0).send({ from: account });
      getStaticInfo();
    } catch (err) {
      console.log(err);
    }
  };

  const checkAllowance = async () => {
    if (!library) return;
    try {
      const allowance = await wethContract.methods
        .allowance(account, process.env.REACT_APP_MASTERCHEF_ADDRESS)
        .call();
      setIsApproved(allowance > 0);
    } catch (err) {
      console.log(err);
    }
  };

  const approveWETH = async () => {
    if (!library) return;
    try {
      await wethContract.methods
        .approve(process.env.REACT_APP_MASTERCHEF_ADDRESS, MAX_UINT256)
        .send({ from: account });
      checkAllowance();
    } catch (err) {
      console.log(err);
    }
  };

  const openStakeModal = () => {
    setVisibleStake(true);
  };

  const openWithdrawModal = () => {
    setVisibleWithdraw(true);
  };

  const onCancelStaking = () => {
    setVisibleStake(false);
  };
  const handleStaking = async (amount: number) => {
    if (!library) return;

    if (amount === 0) {
      openNotification("Amount must be > 0");
      setVisibleStake(false);
      return;
    } 

    if (amount > balance) {
      openNotification("Your balance is " + balance);
      setVisibleStake(false);
      return;
    } 
  
    try {
      setLoadingStake(true);
      await masterContract.methods
        .deposit(+web3.utils.toWei(amount.toString()))
        .send({ from: account });

      getStaticInfo();
    } catch (err) {
      console.log(err);
      openNotification("Staking failed");
    }
    setVisibleStake(false);
    setLoadingStake(false);
  };

  const onCancelWithdraw = () => {
    setVisibleWithdraw(false);
  };

  const handleWithdraw = async (amount: number) => {
    if (!library) return;
    if (amount > amountDeposited) {
      openNotification("Your WETH deposited is " + amountDeposited);
      setVisibleWithdraw(false);
      return;
    }
    try {
      setLoadingWithdraw(true);
      await masterContract.methods
        .withdraw(+web3.utils.toWei(amount.toString()))
        .send({ from: account });

      getStaticInfo();
    } catch (err) {
      openNotification("Widthdraw failed");
    }
    setLoadingWithdraw(false);
    setVisibleWithdraw(false);
  };

  const convertHexToDecimal = (hex: string) => {
    const bn = web3.utils.toBN(hex).toString();
    return +web3.utils.fromWei(bn);
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const fetchData = async () => {
    const client = new ApolloClient({
      uri: URI_QUERY,
      cache: new InMemoryCache(),
    });
    const res = await client.query({
      query: DATA_SUBGRAPH,
    });
    
    const listAction = [...res.data.depositEntities, ...res.data.withdrawEntities];
    const sortedList = listAction.sort((a,b)=> a.time - b.time );
    setDataSource(convertData(sortedList));

    console.log(dataSource);
    
  };

  const convertData = (data:any)=>{
    return data.map((data:any)=>{
      return {...data, action: data.__typename === 'DepositEntity' ?  'Deposit': 'Withdraw' }   
})
  }

  const getStaticInfo = async () => {
    console.log(account);

    if (!library) return;
    setLoading(true);
    await sleep(300);

    const multicall = new Multicall({ web3Instance: web3, tryAggregate: true });
    const addressList = [account, process.env.REACT_APP_MASTERCHEF_ADDRESS];

    try {
      const contractCallContext: any = [
        ...addressList.map((address, index) => {
          return {
            reference: "user" + index,
            contractAddress: process.env.REACT_APP_WETH_ADDRESS,
            abi: WETHABI,
            calls: [
              {
                reference: "balance",
                methodName: "balanceOf",
                methodParameters: [address],
              },
            ],
          };
        }),
        {
          reference: "userInfo",
          contractAddress: process.env.REACT_APP_MASTERCHEF_ADDRESS,
          abi: MCABI,
          calls: [
            {
              reference: "amount",
              methodName: "userInfo",
              methodParameters: [account],
            },
          ],
        },
        {
          reference: "pendingDD2",
          contractAddress: process.env.REACT_APP_MASTERCHEF_ADDRESS,
          abi: MCABI,
          calls: [
            {
              reference: "amount1",
              methodName: "pendingDD2",
              methodParameters: [account],
            },
          ],
        },
      ];
      const result = await multicall.call(contractCallContext);

      const balance0 =
        result.results.user0.callsReturnContext[0].returnValues[0].hex;
      const balance1 =
        result.results.user1.callsReturnContext[0].returnValues[0].hex;
      const userInfo =
        result.results.userInfo.callsReturnContext[0].returnValues[0].hex;
      const pendingDD2 =
        result.results.pendingDD2.callsReturnContext[0].returnValues[0].hex;

      setBalance(convertHexToDecimal(balance0));
      setTotalStaked(convertHexToDecimal(balance1));
      setAmountDeposited(convertHexToDecimal(userInfo));
      setTokenEarned(convertHexToDecimal(pendingDD2));
      setLoading(false);
      fetchData();
    } catch (err) {
      console.log(err);
      openNotification("Get failed");
      window.location.reload();
    }
  
  };

  useEffect(() => {
    if (account) {
      checkAllowance();
      getStaticInfo();
    }
  }, [account]);

  const columns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text: any) => (
        <span>{web3.utils.fromWei(text)}</span>
      )
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (text: any) => (
        <span>{convertTime(text)}</span>
      )
    },
  ];

  return (
    <div className={styles.wrapper}>
      <Row>
        <Col lg={12} md={24} sm={24}>
          {isLoading ? (
            <div style={{ textAlign: "center" }}>
              {" "}
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row className={styles.row}>
                <Col md={12}>
                  Wallet address : {account && formatAddress(account, 4, 4)}
                </Col>
                <Col md={12}>Balance: {balance.toFixed(6)} WETH</Col>
              </Row>
              <Row className={styles.row}>
                <Col md={12}>Token earned : {tokenEarned.toFixed(6)} DD2</Col>
                <Col md={12}>
                  <Button onClick={onHarvest}>Harvest</Button>
                </Col>
              </Row>
              {!isApproved ? (
                <Button onClick={approveWETH}>Approve</Button>
              ) : (
                <Row className={styles.row}>
                  <Col md={12}>
                    <Button onClick={openStakeModal}>Stake</Button>
                  </Col>
                  <Col md={12}>
                    <Button onClick={openWithdrawModal}>Withdraw</Button>
                  </Col>
                </Row>
              )}

              <div className={styles.row}>
                Your stake: {amountDeposited.toFixed(6)} WETH
              </div>
              <div className={styles.row}>
                Total stake: {totalStaked.toFixed(6)} WETH
              </div>
              <StakingModal
                wethBalance={balance.toFixed(6)}
                isVisibleStake={isVisibleStake}
                handleCancelStake={onCancelStaking}
                handleOk={handleStaking}
                isLoadingStake={isLoadingStake}
              />
              <WithdrawModal
                wethDeposited={amountDeposited}
                isVisibleWithdraw={isVisibleWithdraw}
                handleCancelWithdraw={onCancelWithdraw}
                handleOk={handleWithdraw}
                isLoadingWithdraw={isLoadingWithdraw}
              />
            </>
          )}
        </Col>

        <Col lg={12} md={24} sm={24}>
          <p>History of account</p>
          <Table dataSource={dataSource} columns={columns} />
        </Col>
      </Row>
    </div>
  );
};

export default StakingPool;
