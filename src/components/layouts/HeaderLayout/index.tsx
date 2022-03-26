import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { Button } from "antd";
import { Header } from "antd/lib/layout/layout";
import { useEffect, useState } from "react";
import ModalConnectWallet from "../../connect-wallet";
import { openNotification } from "../../staking-pool";

export const formatAddress = (
    address: string,
    startLength: number,
    suffixLength: number
) => {
    const start = address?.slice(0, startLength).trim();
    const suffix = address?.slice(-suffixLength).trim();

    return (
        <span>
            {start}...{suffix}
        </span>
    );
};

const NETWORK_ID = process.env.REACT_APP_NETWORK_ID || 0;
const WALLETCONNECT_BRIDGE_URL = "https://bridge.walletconnect.org";

const HeaderLayout = () => {
    const [isConnectModalVisible, setConnectModalVisible] =
        useState<boolean>(false);

    const { account, activate, deactivate} = useWeb3React();

    const onOpenConnectWallet = () => {
        setConnectModalVisible(true);
    };

    const onCancelConnectWallet = () => {
        setConnectModalVisible(false);
    };

    const injected = new InjectedConnector({
        supportedChainIds: [+NETWORK_ID],
    });

    //   const NETWORK_URLS = {
    //     4: RPC_URL,
    //   };

    const INFURA_KEY = "29cf180bd7d140449664f288a7b36ee9";
    const NETWORK_URLS = {
        1: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
        4: `https://rinkeby.infura.io/v3/${INFURA_KEY}`
    };

    const walletConnectConnector = new WalletConnectConnector({
        supportedChainIds: [1, 4],
        rpc: NETWORK_URLS,
        bridge: WALLETCONNECT_BRIDGE_URL,
        qrcode: true,
    });

    const onConnectErr = (err: any) => {
        console.log(err);
        openNotification("connect error");
    };

    const connectToMetamask = () => {
        activate(injected, onConnectErr);
        localStorage.setItem("connector", "metamask");
        onCancelConnectWallet();
    };

    const connectToWalletConnect = () => {
        console.log(walletConnectConnector);

        activate(walletConnectConnector, onConnectErr);
        localStorage.setItem("connector", 'walletconnect');
        onCancelConnectWallet();
    };

    const disconnectWallet = () => {
        deactivate();
        localStorage.removeItem("connector");
        onCancelConnectWallet();
    };

    const checkConnector = async () => {
        if (!account) {
            const connectedBy = localStorage.getItem("connector");
            switch (connectedBy) {
                case "metamask":
                    const isAuthorized = await injected.isAuthorized();
                    isAuthorized && connectToMetamask();
                    return;
                case "walletconnect":
                    connectToWalletConnect();
                    return;
                default:
                    return;
            }
        }
    };

    useEffect(() => {
        checkConnector();
    }, [account])

    return (
        <Header>
            <Button onClick={onOpenConnectWallet}>
                {account ? formatAddress(account, 4, 4) : "Connect wallet"}
            </Button>
            <ModalConnectWallet
                isConnectModalVisible={isConnectModalVisible}
                handleCancel={onCancelConnectWallet}
                onConnectToMetamask={connectToMetamask}
                onConnectToWalletConnect={connectToWalletConnect}
                disconnectWallet={disconnectWallet}
            />
        </Header>
    );
};

export default HeaderLayout;
