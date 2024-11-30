export class AccountDTO {
  account: string | null;
  privateKey: string | null;

  constructor(account: string, privateKey: string) {
    this.account = account;
    this.privateKey = privateKey;
  }

}
