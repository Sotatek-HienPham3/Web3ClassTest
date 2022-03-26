import { Button, Input, Spin } from "antd";
import Modal from "antd/lib/modal/Modal";
import { useEffect, useState } from "react";
import styles from "../style.module.scss";

// eslint-disable-next-line
export default (props: any) => {
  const {
    isVisibleWithdraw,
    handleCancelWithdraw,
    handleOk,
    wethDeposited,
    isLoadingWithdraw,
  } = props;
  const [amount, setAmount] = useState<number>(0);

  const handleChangeInput = (e: any) => {
    setAmount(e.target.value);
  };

  useEffect(() => {
    if (!isVisibleWithdraw) {
      setAmount(0);
    }
  }, [isVisibleWithdraw]);

  return (
    <Modal
      title="Withdraw"
      visible={isVisibleWithdraw}
      onCancel={handleCancelWithdraw}
      footer={[
        !isLoadingWithdraw && <Button
          onClick={() => {
            handleOk(amount);
          }}
          type="primary"
        >
          Withdraw
        </Button>,
      ]}
      className="modalStaking"
    >
      {!isLoadingWithdraw ? (
        <>
          <Input
            placeholder="Input your amount"
            value={amount}
            onChange={handleChangeInput}
            type="number"
            className={styles.input}
          />
          <div>Your WETH deposited: {wethDeposited.toFixed(6)} WETH</div>
        </>
      ) : (
        <div style={{textAlign:'center', fontSize : '18px'}}>
          <Spin /> <p>Please wait a few seconds</p>
        </div>
      )}
    </Modal>
  );
};
