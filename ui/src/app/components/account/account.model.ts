export class AccountDTO {
  account: string | null;
  privateKey: string | null;
  role: string | null;

  constructor(account: string, privateKey: string, role: string) {
    this.account = account;
    this.privateKey = privateKey;
    this.role = role;
  }

}
