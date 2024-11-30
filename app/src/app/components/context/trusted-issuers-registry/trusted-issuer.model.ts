export class TrustedIssuerDTO {
  address: string | null;
  claimTopics: string[] | null;

  constructor(address: string | null, claimTopics: string[] | null) {
    this.address = address;
    this.claimTopics = claimTopics;
  }
}
