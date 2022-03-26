import { useWeb3React } from "@web3-react/core";
import { Button } from "antd";
import Modal from "antd/lib/modal/Modal";
import MetaMaskIcon from '../../assets/images/metamask.svg';
import WalletConnectIcon from '../../assets/images/walletconnect.svg';
import styles from './style.module.scss';

// eslint-disable-next-line
export default (props: any) => {
    const { isConnectModalVisible, handleCancel, onConnectToMetamask, disconnectWallet, onConnectToWalletConnect } = props;
    const { account } = useWeb3React();

    return <Modal
        title="Connect wallet"
        visible={isConnectModalVisible}
        onCancel={handleCancel}
        footer=""
    >

        {!account ?
            <>
                <div className={styles.wrapBtn}  onClick={onConnectToMetamask}>
                    <img src={MetaMaskIcon} alt="metamask icon" />
                    <span>Connect to Metamask</span>
                </div>
                <div className={styles.wrapBtn}  onClick={onConnectToWalletConnect}>
                    <img src={WalletConnectIcon} alt="walletconnect icon" />
                    <span>Connect to Wallet connect</span>
                </div>

            </>
            : <Button onClick={disconnectWallet} type="primary">Disconnect</Button>
        }
    </Modal>
}