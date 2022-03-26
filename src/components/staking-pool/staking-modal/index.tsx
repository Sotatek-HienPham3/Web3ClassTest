import { Button, Input, Spin } from "antd";
import Modal from "antd/lib/modal/Modal";
import { useEffect, useState } from "react";
import styles from "../style.module.scss";

// eslint-disable-next-line
export default (props: any) => {
  const {
    isVisibleStake,
    handleCancelStake,
    handleOk,
    wethBalance,
    isLoadingStake,
  } = props;
  const [amount, setAmount] = useState<number>(0);
  console.log({isLoadingStake});
  
  const handleChangeInput = (e: any) => {
    setAmount(e.target.value);
  };

  useEffect(() => {
    if (!isVisibleStake) {
      setAmount(0);
    }
  }, [isVisibleStake]);

  return (
    <Modal
      title="Staking"
      visible={isVisibleStake}
      onCancel={handleCancelStake}
      footer={[
        !isLoadingStake &&  <Button
          onClick={() => {
            handleOk(amount);
          }}
          type="primary"
        >
          Stake
        </Button>
      ]}
      className="modalStaking"
    >
      {!isLoadingStake ? (
        <>
          <Input
            placeholder="Input your amount"
            value={amount}
            onChange={handleChangeInput}
            type="number"
            className={styles.input}
          />
          <div>Your WETH balance: {wethBalance} WETH</div>
        </>
      ) : (
        <div style={{textAlign:'center', fontSize : '18px'}}>
          <Spin /> <p>Please wait a few seconds</p>
        </div>
      )}
    </Modal>
  );
};
