export interface ZkWallet {
  readonly address: string;
  signMessage(message: string): Promise<string>;
  signTx(txData: any): Promise<string>;
}